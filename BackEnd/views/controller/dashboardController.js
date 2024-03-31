const axios = require('axios');
require('dotenv').config();
const session = require('express-session');


// Dashboard controller
exports.dashboard = async (req, res) => {
    try {
        const { segment } = req.params;
        console.log("segment:",segment);
         // console.log("token:",req.session.token);
        // If user is not authenticated, redirect to login page
      // klo udh dibuat sesi nya nyalain lagi
      //   if (!req.session.token) {
      //       return res.redirect('/');
      //   }



        // Logic to fetch dashboard data based on $segment
        const baseUrl = process.env.API;
        const artikelUrl = `${baseUrl}/api/v1/artikel/get-all`;
        const kategoriUrl = `${baseUrl}/api/v1/kategori/get-all`;

        const [artikelResponse, kategoriResponse] = await Promise.all([
            axios.get(artikelUrl),
            axios.get(kategoriUrl)
        ]);

        const artikelData = artikelResponse.data;
        const kategoriData = kategoriResponse.data;
        console.log("artikelData:",artikelData);
        console.log("lengthData:",artikelData.data.length);
        // Check if there are any articles
        if (!artikelData.data.length === 0) {
         console.log("articles found.");
            // If there are articles, send article data to view
            return res.render('dashboard', {
                title: 'InsightHub - Lets Start the journey with us',
                first_name: segment,
               //  token: req.session.token,
                artikel: artikelData,
                kategori: kategoriData
            });
        } else {
         console.log("no articles found.");
            // If there are no articles, render a different view
            return res.render('dashboard_no_artikel', {
                title: 'InsightHub - Lets Start the journey with us',
                first_name: segment,
               //  token: req.session.token,
                artikel: artikelData,
                kategori: kategoriData
            });
        }
    } catch (error) {
        console.error('Failed to fetch data from API:', error);
        return res.status(500).render('error', { error: 'Failed to fetch data from API.' });
    }
};
