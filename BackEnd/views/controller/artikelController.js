const axios = require("axios");
require("dotenv").config();
const session = require("express-session");
const prisma = require("../../libs/prisma");
const { checkSession } = require("../controller/checkSessionController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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


      // artikel
      const endpointArtikel = '/api/v1/artikel/get-all'; // End point yang ingin Anda ambil
      const artikel = baseUrl + endpointArtikel; // Menggabungkan base URL dengan end point
      const responseArtikel = await axios.get(artikel);
      // console.log(responseArtikel.data.data);
      const dataArtikel = responseArtikel.data.data;

      // If there are articles, send article data to view
      return res.render("add-artikel", {
        title: "InsightHub - Lets Start the journey with us",
        first_name: first_name,
        id: id,
        status: status,
        token: token,
        kategori: kategoriData,
        artikel: dataArtikel,
        baseUrl: process.env.API,
      });
    
  } catch (error) {
    console.error("Failed to fetch data from API:", error);
    return res
      .status(500)
      .render("error", { error: "Failed to fetch data from API." });
  }
};


// Controller untuk membuat artikel baru
exports.createArtikel = async (req, res) => {
  try {
    const { first_name, id } = req.params; // Mengambil nilai first_name dan id dari parameter rute
    const { judul, deskripsi, link, kategori_nama, kategori_deskripsi } = req.body; // Mengambil data artikel dari body permintaan
    console.log("isi body:", req.body);
    // Mengambil gambar artikel dari form (jika ada)
    const gambar_artikel = req.file;

    
    // Panggil fungsi checkSession untuk memeriksa sesi
    const session = await checkSession(id);

    // Jika sesi tidak valid, arahkan pengguna kembali ke halaman login
    if (!session) {
      return res.redirect("/");
    }

    // Baca nilai session
    const user = session.sess.user;
    const status = user && user.status;
    const token = user && user.token;

    // Jika pengguna tidak diautentikasi, redirect ke halaman login
    if (!token) {
      return res.redirect("/");
    }

    // Logic to fetch dashboard data based on $first_name
    const baseUrl = process.env.API;
    const uploadArtikel = `${baseUrl}/api/v1/artikel/add`;
    const uploadKategori = `${baseUrl}/api/v1/kategori/add`;

    // Data untuk membuat kategori baru
    const kategoriData = {
      nama: kategori_nama,
      deskripsi: kategori_deskripsi,
    };

    console.log("Kategori Data:", kategoriData);
    // Lakukan permintaan HTTP POST ke server API untuk membuat kategori baru
    const kategoriResponse = await axios.post(uploadKategori, kategoriData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Kategori Response:", kategoriResponse.data);
    // Jika permintaan kategori berhasil, ambil kategoriId dari respon
    const kategoriId = kategoriResponse.data.data.id;

    // Data untuk membuat artikel baru
    const artikelData = {
      judul,
      deskripsi,
      link,
      kategoriId, // Gunakan kategoriId yang baru dibuat
    };

    console.log("Artikel Data:", artikelData);

    // Jika ada gambar artikel, tambahkan ke objek data
    if (gambar_artikel) {
      artikelData.gambar_artikel = gambar_artikel.path;
    }

    console.log("Gambar Artikel:", gambar_artikel);
    // Lakukan permintaan HTTP POST ke server API untuk membuat artikel baru
    const response = await axios.post(uploadArtikel, artikelData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("response:", JSON.stringify(response));
    // Kembalikan respons dari server API
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Failed to create article:", error);
    res.status(500).json({ error: "Failed to create article." });
  }
};