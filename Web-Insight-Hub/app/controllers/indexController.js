const axios = require('axios');
require('dotenv').config();

exports.getIndexPage = async (req, res) => {
   try {
      // kategori
      const baseUrl = process.env.API; // Mengambil base URL dari variabel lingkungan
      const endpointKategori = '/api/v1/kategori/get-all'; // End point yang ingin Anda ambil
      const kategori = baseUrl + endpointKategori; // Menggabungkan base URL dengan end point
      const responseKategori = await axios.get(kategori);
      const dataKategori = responseKategori.data;

      // artikel
      const endpointArtikel = '/api/v1/artikel/get-all'; // End point yang ingin Anda ambil
      const artikel = baseUrl + endpointArtikel; // Menggabungkan base URL dengan end point
      const responseArtikel = await axios.get(artikel);
      // console.log(responseArtikel.data.data);
      const dataArtikel = responseArtikel.data.data;

      res.render('index', { 
         kategori: dataKategori, 
         title: 'InsightHub - Lets Start the journey with us', 
         articles: dataArtikel 
      });

   } catch (error) {
      console.error('Gagal mengambil data dari API:', error);
   }
}