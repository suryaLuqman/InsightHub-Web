const axios = require("axios");
require("dotenv").config();
const session = require("express-session");
const prisma = require("../../libs/prisma");
const { checkSession } = require("../controller/checkSessionController");
const getUserProfile = require("../controller/getUserProfileController");
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

    const [kategoriResponse] = await Promise.all([axios.get(kategoriUrl)]);

    const kategoriData = kategoriResponse.data;

    // artikel
    const endpointArtikel = "/api/v1/artikel/get-all"; // End point yang ingin Anda ambil
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
    const { judul, deskripsi, link, kategori_nama, kategori_deskripsi } =
      req.body; // Mengambil data artikel dari body permintaan
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

// controller search artikel
exports.searchArtikel = async (req, res) => {
  try {
    const judul = req.query.judul;
    const baseUrl = process.env.API;

    // Artikel
    const endpointArtikel = `/api/v1/search-artikel/search?judul=${judul}`; // End point yang ingin Anda ambil
    const artikelUrl = baseUrl + endpointArtikel; // Menggabungkan base URL dengan end point
    // console.log("artikelUrl:", artikelUrl);
    const responseArtikel = await axios.get(artikelUrl);
    const dataArtikel = responseArtikel.data;

    // Kategori
    let dataKategori = [];
    dataArtikel.forEach((artikel) => {
      dataKategori = dataKategori.concat(artikel.kategori);
    });

    // Remove duplicates
    dataKategori = [...new Set(dataKategori.map(JSON.stringify))].map(
      JSON.parse
    );

    // console.log("dataKategori:", dataKategori);

    // console.log("req rawHeaders: ", req.rawHeaders);
    // Find the index of 'Cookie' in the rawHeaders array
    const cookieIndex = req.rawHeaders.indexOf("Cookie");
    if (cookieIndex !== -1) {
      const cookie = req.rawHeaders[cookieIndex + 1];
      // console.log("Cookie:", cookie);

      // Use a regular expression to extract the token value from the cookie string
      const tokenMatch = cookie.match(/token=([^;]*)/);
      if (tokenMatch) {
        const token = tokenMatch[1];
        // console.log("Token:", token);

        const userProfile = await getUserProfile.getUserProfile(token);
        // console.log("userProfile:", userProfile);
        const first_name = userProfile.data.userProfile.first_name;
        const id = userProfile.data.userProfile.id;
        const status = userProfile.data.userProfile.status;
        // console.log("artikel:", dataArtikel);
        // If there are articles, send article data to view
        return res.render("hasil-pencarian", {
          title: "InsightHub - Lets Start the journey with us",
          first_name: first_name,
          id: id,
          status: status,
          token: token,
          artikel: dataArtikel,
          kategori: dataKategori,
        });
      } else {
        console.log("Token not found");
        return res.render("search-artikel", {
          title: "InsightHub - Lets Start the journey with us",
          first_name: "user",
          id: null,
          status: "pembaca",
          token: null,
          artikel: dataArtikel,
          kategori: dataKategori,
        });
      }
    } else {
      console.log("Cookie not found");
      return res.render("hasil-pencarian", {
          title: "InsightHub - Lets Start the journey with us",
          first_name: "user",
          id: null,
          status: "pembaca",
          token: null,
          artikel: dataArtikel,
          kategori: dataKategori,
      });
    }
  } catch (error) {
    console.error("Failed to fetch data from API:", error);
    return res
      .status(500)
      .render("error", { error: "Failed to fetch data from API." });
  }
};

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


    // Kategori
    let dataKategori = [];
    artikelData.forEach((artikel) => {
      dataKategori = dataKategori.concat(artikel.kategori);
    });

    // Remove duplicates
    dataKategori = [...new Set(dataKategori.map(JSON.stringify))].map(
      JSON.parse
    );

    const cookieIndex = req.rawHeaders.indexOf("Cookie");
    if (cookieIndex !== -1) {
      const cookie = req.rawHeaders[cookieIndex + 1];
      // console.log("Cookie:", cookie);

      // Use a regular expression to extract the token value from the cookie string
      const tokenMatch = cookie.match(/token=([^;]*)/);
      if (tokenMatch) {
        const token = tokenMatch[1];
        // console.log("Token:", token);

        const userProfile = await getUserProfile.getUserProfile(token);
        console.log("userProfile:", userProfile);
        console.log("artikelData:", artikelData);
        const first_name = userProfile.data.userProfile.first_name;
        const id = userProfile.data.userProfile.id;
        const status = userProfile.data.userProfile.status;
        const ratings = userProfile.data.ratings;
        const reports = userProfile.data.reports;

        ratings.forEach(rating => {
          console.log("rating : ",rating);
        });

        reports.forEach(report => {
          console.log("report : ",report);
        });
        
        // check user has rate article or not
        const ratedArticles = [];

        ratings.forEach(rating => {
          if (rating.artikelId === artikelId) {
            ratedArticles.push(rating);
          }
        });

        ratedArticles.forEach(ratedArticle => {
          console.log("ratedArticle : ",ratedArticle);
        });
        console.log("length of ratedArticles : ",ratedArticles.length);

        // check user has report article or not
        const reportedArticles = [];
        reports.forEach(report => {
          if (report.artikelId === artikelId) {
            reportedArticles.push(report);
          }
        });

        reportedArticles.forEach(reportedArticle => {
          console.log("reportedArticle : ",reportedArticle);
        });
        console.log("length of reportedArticles : ",reportedArticles.length);

        // console.log("artikel:", dataArtikel);
        // If there are articles, send article data to view
        return res.render("viewArtikel", {
          title: "View Artikel - InsightHub",
          first_name: first_name,
          id: id,
          status: status,
          token: token,
          artikel: artikelData,
          kategori: dataKategori,
          userRating: ratedArticles,
          userReported: reportedArticles,
        })
      }else {
        console.log("Token not found");
        return res.render("viewArtikel", {
          title: "View Artikel - InsightHub",
          first_name: "user",
          id: null,
          status: "pembaca",
          token: null,
          artikel: artikelData,
          kategori: dataKategori,
        });
      }
    } else {
      console.log("Cookie not found");
      return res.render("viewArtikel", {
        title: "View Artikel - InsightHub",
        first_name: "user",
        id: null,
        status: "pembaca",
        token: null,
        artikel: artikelData,
        kategori: dataKategori,
      });
      }
  } catch (error) {
    console.error("Failed to fetch data from API:", error);
    return res
      .status(500)
      .render("error", { error: "Failed to fetch data from API." });
  }
};

exports.updateArtikelPage = async (req, res) => {
  try {
    const { first_name, id,artikelId } = req.params;

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

    const [kategoriResponse] = await Promise.all([axios.get(kategoriUrl)]);

    const kategoriData = kategoriResponse.data;

    // artikel
    const endpointArtikel = "/api/v1/artikel/get-all"; // End point yang ingin Anda ambil
    const artikel = baseUrl + endpointArtikel; // Menggabungkan base URL dengan end point
    const responseArtikel = await axios.get(artikel);
    // console.log(responseArtikel.data.data);
    const dataArtikel = responseArtikel.data.data;

    // // Get Artikel by Id
    // console.log("artikelId : ",artikelId);
    // const endpointArtikelID = `/api/v1/search-artikel/search?artikelId=${artikelId}`;
    // const artikelID = baseUrl + endpointArtikelID;
    // console.log("artikelID : ",artikelID);
    // const responseArtikelID = await axios.get(artikelID);
    // console.log("responseArtikelID : ",responseArtikelID.data.data);
    // const dataArtikelID = responseArtikelID.data.data;

    // Artikel get by ID
    const endpointArtikelID = `/api/v1/search-artikel/search?artikelId=${artikelId}`; // End point yang ingin Anda ambil
    // console.log("endpointArtikelID : ",endpointArtikelID);
    const urlArtikelID = baseUrl + endpointArtikelID; // Menggabungkan base URL dengan end point
    // console.log("urlArtikelID : ",urlArtikelID);
    const responseArtikelID = await axios.get(urlArtikelID);
    // console.log("responseArtikelID : ",responseArtikelID);
    const dataArtikelID = responseArtikelID.data;
    // console.log("dataArtikelID : ",dataArtikelID);

    // If there are articles, send article data to view
    return res.render("update-artikel", {
      title: "InsightHub - Lets Start the journey with us",
      first_name: first_name,
      id: id,
      status: status,
      token: token,
      kategori: kategoriData,
      artikel: dataArtikel,
      artikelbyID:dataArtikelID,
      artikelId: artikelId,
      baseUrl: process.env.API,
    });
  } catch (error) {
    console.error("Failed to fetch data from API:", error);
    return res
      .status(500)
      .render("error", { error: "Failed to fetch data from API." });
  }
};