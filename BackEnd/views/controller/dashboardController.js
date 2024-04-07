const axios = require("axios");
require("dotenv").config();
const session = require("express-session");
const prisma = require("../../libs/prisma");
const { checkSession } = require("../controller/checkSessionController");


let globalToken = ""; // variabel global untuk menyimpan token

// Set token ke variabel global
const setGlobalToken = (token) => {
  globalToken = token;
};

// Dashboard controller
exports.dashboard = async (req, res) => {
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
   setGlobalToken(token);

    // Jika pengguna tidak diautentikasi, redirect ke halaman login
    if (!token) {
      return res.redirect("/");
    }

    // Logic to fetch dashboard data based on $first_name
    const baseUrl = process.env.API;
    const artikelUrl = `${baseUrl}/api/v1/artikel/get-all`;
    const kategoriUrl = `${baseUrl}/api/v1/kategori/get-all`;

    const [artikelResponse, kategoriResponse] = await Promise.all([
      axios.get(artikelUrl),
      axios.get(kategoriUrl),
    ]);

    const artikelData = artikelResponse.data;
    const kategoriData = kategoriResponse.data;
   //  console.log("artikelData:", artikelData);
   //  console.log("lengthData:", artikelData.data.length);
    // Check if there are any articles
    if (artikelData.data.length > 0) {
      console.log("articles found.");
      // If there are articles, send article data to view
      return res.render("dashboard", {
        title: "InsightHub - Lets Start the journey with us",
        first_name: first_name,
        id: id,
        status: status,
        token: token,
        artikel: artikelData,
        kategori: kategoriData,
      });
    } else {
      console.log("no articles found.");
      // If there are no articles, render a different view
      return res.render("dashboard_no_artikel", {
        title: "InsightHub - Lets Start the journey with us",
        first_name: first_name,
        id: id,
        status: status,
        token: token,
        artikel: artikelData,
        kategori: kategoriData,
      });
    }
  } catch (error) {
    console.error("Failed to fetch data from API:", error);
    return res
      .status(500)
      .render("error", { error: "Failed to fetch data from API." });
  }
};


// Controller to render viewArtikel page and fetch article based on artikelId
exports.getViewArtikelPage = async (req, res) => {
  try {
    const { id } = req.params; // Mengambil id dari parameter route
    const artikelId = parseInt(id); // Mengkonversi id menjadi integer jika diperlukan
    console.log("artikelId:", artikelId);
    // Lakukan validasi jika artikelId tidak ada atau tidak valid
    if (!artikelId || isNaN(artikelId)) {
      return res.status(400).render("error", { error: "Invalid Artikel ID." });
    }

    // Lakukan permintaan HTTP GET ke API untuk mencari artikel berdasarkan artikelId
    const baseUrl = process.env.API;
    const artikelUrl = `${baseUrl}/api/v1/search-artikel/search?artikelId=${artikelId}`;

    const artikelResponse = await axios.get(artikelUrl);
    const artikelData = artikelResponse.data;
    const token = globalToken;
    console.log("token:", token);
    console.log("artikelData:", artikelData);
    // Render viewArtikel page dengan data artikel yang ditemukan
    return res.render("viewArtikel", {
      title: "View Artikel - InsightHub",
      artikel: artikelData,
      token: token,
    });
  } catch (error) {
    console.error("Failed to fetch data from API:", error);
    return res
      .status(500)
      .render("error", { error: "Failed to fetch data from API." });
  }
};