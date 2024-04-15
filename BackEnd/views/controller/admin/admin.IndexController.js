const axios = require("axios");
require("dotenv").config();

exports.getIndexPage = async (req, res) => {
  try {
    res.render("admin/login", {
      title: "InsightHub - Lets Start the journey with us",
      urlAPI: process.env.API,
    });
  } catch (error) {
    console.error("Gagal mengambil data dari API:", error);
    let statusCode = error.response && error.response.status ? error.response.status : 500;
    return res.status(statusCode).render("error", {
      title: `${statusCode} Error - ${error.message}`,
      error: error.message,
      statusCode: statusCode
    });
  }
};
