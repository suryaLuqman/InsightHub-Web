const axios = require("axios");
require("dotenv").config();
const session = require("express-session");
const { checkSession } = require("../controller/checkSessionController");

// Dashboard controller
exports.getProfilePage = async (req, res) => {
  try {
    const { segment, id } = req.params;
    console.log("segment:", segment);

    // Panggil fungsi checkSession untuk memeriksa sesi
    const session = await checkSession(id);
   //  console.log("session profile controller:", session);
    // Jika sesi tidak valid, arahkan pengguna kembali ke halaman login
    if (!session) {
      return res.redirect("/");
    }

    // Baca nilai session
    const user = session.sess.user;
    const status = user && user.status;
    const token = user && user.token;
    // console.log("session baca nilai sessiion profile:", user);
   //  console.log("status:", status);
   //  console.log("token:", token);

    const userId = session.userId;

    // Logic to fetch profile data
    const baseUrl = process.env.API;
    const profileUrl = `${baseUrl}/api/v1/auth/profile`;
    const artikelUrl = `${baseUrl}/api/v1/search-artikel/search?authorId=${userId}`;
    const kategoriUrl = `${baseUrl}/api/v1/kategori/get-all`;

    const [profileResponse, artikelResponse, kategoriResponse] =
      await Promise.all([
        axios.get(profileUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(artikelUrl),
        axios.get(kategoriUrl),
      ]);

    const profileData = profileResponse.data;
    const artikelData = artikelResponse.data;
    const kategoriData = kategoriResponse.data;

    // console.log("profileData:", profileData);
    // console.log("artikelData:", artikelData);

    if (!profileData || !artikelData) {
      console.log("Failed to fetch profile or article data.");
      return res
        .status(500)
        .render("error", { error: "Failed to fetch profile or article data." });
    }
    // console.log("length:", artikelData.length);

    if (artikelData.length > 0) {
      console.log("articles found.");
      // If there are articles, send article data to view
      // Render the profile page with the retrieved data
      return res.render("profile", {
        title: `Insight - ${segment || "Profile"}`,
        profile: profileData,
        email:user.email,
        artikel: artikelData,
        kategori: kategoriData,
        urlAPI: process.env.API,
        token: token
      });
    } else {
      console.log("no articles found.");
      // If there are no articles, render a different view
      // Render the profile page with the retrieved data
      return res.render("profile_no_artikel", {
        title: `Insight - ${segment || "Profile"}`,
        profile: profileData,
        email:user.email,
        artikel: artikelData,
        kategori: kategoriData,
        urlAPI: process.env.API,
        token: token
      });
    }
  } catch (error) {
    console.error("Failed to fetch data from API:", error);
    return res
      .status(500)
      .render("error", { error: "Failed to fetch data from API." });
  }
};
