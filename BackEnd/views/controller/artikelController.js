const axios = require("axios");
require("dotenv").config();
const session = require("express-session");
const prisma = require("../../libs/prisma");
const { checkSession } = require("../controller/checkSessionController");

// Dashboard controller
exports.getArtikelPage = async (req, res) => {
  try {
    const { first_name, id } = req.params;

    // Panggil fungsi checkSession untuk memeriksa sesi
    const session = await checkSession(id);
   // console.log("session checController dasboard:", session);
    // Jika sesi tidak valid, arahkan pengguna kembali ke halaman login
    if (!session) {
      return res.redirect("/");
    }

    // Baca nilai session
    const user = session.sess.user;
    const status = user && user.status;
    const token = user && user.token;
   //  console.log("session baca nilai sessiion:", user);
   //  console.log("status:", status);
   //  console.log("token:", token);

    // Jika pengguna tidak diautentikasi, redirect ke halaman login
    if (!token) {
      return res.redirect("/");
    }

    // Logic to fetch dashboard data based on $first_name
    const baseUrl = process.env.API;
    const kategoriUrl = `${baseUrl}/api/v1/kategori/get-all`;

    const [kategoriResponse] = await Promise.all([
      axios.get(kategoriUrl),
    ]);

    const kategoriData = kategoriResponse.data;

      // If there are articles, send article data to view
      return res.render("add-artikel", {
        title: "InsightHub - Lets Start the journey with us",
        first_name: first_name,
        id: id,
        status: status,
        token: token,
        kategori: kategoriData,
      });
    
  } catch (error) {
    console.error("Failed to fetch data from API:", error);
    return res
      .status(500)
      .render("error", { error: "Failed to fetch data from API." });
  }
};
