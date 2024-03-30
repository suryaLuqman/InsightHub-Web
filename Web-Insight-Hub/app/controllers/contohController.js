const axios = require('axios');

exports.getContohPage = async (req, res) => {
    try {
        const response = await axios.get('https://insight-hub-api.vercel.app/api/v1/kategori/get-all');
        console.log("response : ", response);
        const dataKategori = response.data;
         console.log('Data kategori:', dataKategori); // Tambahkan ini untuk mencetak data artikel
        res.render('contohView', {articles: dataKategori });
    } catch (error) {
        console.error('Gagal mengambil data dari API:', error);
        res.status(500).send('Terjadi kesalahan');
    }
};
