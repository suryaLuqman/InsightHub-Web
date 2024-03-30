const axios = require('axios');

exports.getContohPage = async (req, res) => {
    try {
        const response = await axios.get('https://insight-hub-api.vercel.app/api/v1/artikel/get-all');
        const articles = response.data;

        res.render('contohView', { articles });
    } catch (error) {
        console.error('Gagal mengambil data dari API:', error);
        res.status(500).send('Terjadi kesalahan');
    }
};
