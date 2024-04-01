const axios = require("axios");
require("dotenv").config();
const session = require("express-session");

// Dashboard controller
exports.getProfilePage = async (req, res) => {
  try {
    const { segment } = req.params;
    console.log("segment:", segment);

    const token = req.session.user.token;
    const userId = req.session.user.id;

    // Logic to fetch profile data
    const baseUrl = process.env.API;
    const profileUrl = `${baseUrl}/api/v1/auth/profile`;
    const artikelUrl = `${baseUrl}/api/v1/search-artikel/search?authorId=${userId}`;
    const kategoriUrl = `${baseUrl}/api/v1/kategori/get-all`;

    const [profileResponse, artikelResponse, kategoriResponse] = await Promise.all([
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
    
    console.log("profileData:", profileData);
    console.log("artikelData:", artikelData);

    if (!profileData || !artikelData) {
      console.log("Failed to fetch profile or article data.");
      return res.status(500).render("error", { error: "Failed to fetch profile or article data." });
    }

    // Render the profile page with the retrieved data
    return res.render("profile", {
      title: `Insight - ${segment || "Profile"}`,
      profile: profileData,
      artikel: artikelData,
      kategori: kategoriData,
    });
  } catch (error) {
    console.error("Failed to fetch data from API:", error);
    return res.status(500).render("error", { error: "Failed to fetch data from API." });
  }
};
