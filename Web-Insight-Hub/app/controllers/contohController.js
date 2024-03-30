const axios = require('axios');
require('dotenv').config();

exports.getContohPage = async (req, res) => {
    try {
        const baseUrl = process.env.API; // Mengambil base URL dari variabel lingkungan
        const endpoint = '/api/v1/kategori/get-all'; // End point yang ingin Anda ambil
        const apiUrl = baseUrl + endpoint; // Menggabungkan base URL dengan end point

        console.log("API URL: ", apiUrl);

        const response = await axios.get(apiUrl); // Menggunakan URL lengkap untuk memanggil API
        const dataKategori = response.data;
        console.log('Data kategori:', dataKategori);
        res.render('contohView', { articles: dataKategori });
    } catch (error) {
        console.error('Gagal mengambil data dari API:', error);
        res.status(500).send('Terjadi kesalahan');
    }
};
