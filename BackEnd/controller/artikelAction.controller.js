require('dotenv').config();
const jwt = require('jsonwebtoken');
const prisma = require('../libs/prisma');

// Middleware untuk mengotentikasi pengguna
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    req.token = bearerToken;
    jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
      if (err) {
         res.sendStatus(403);
      } else {
         // console.log(authData); // Mencetak authData untuk memeriksa strukturnya
         req.user = authData;
         next();
      }
   });
  } else {
    res.sendStatus(403);
  }
}


// Controller untuk menyimpan artikel
const saveArtikel = async (req, res, next) => {
  try {
   const { artikelId } = req.params;
   const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is undefined",
      });
    }

    const existingArtikel = await prisma.artikel.findUnique({
      where: { id: parseInt(artikelId) },
    });

    if (!existingArtikel) {
      return res.status(404).json({
        success: false,
        message: 'Artikel not found',
        data: null,
      });
    }

    const savedArtikel = await prisma.user.update({
      where: { id: userId },
      data: { articles: { connect: { id: existingArtikel.id } } }, // Menghubungkan artikel ke pengguna
    });

    res.status(200).json({
      success: true,
      message: 'Artikel saved successfully',
      data: savedArtikel.articles || [], // Menggunakan nilai default jika tidak tersedia
    });
  } catch (error) {
    console.error('Error saving artikel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save artikel',
      error: error.message,
      data: null,
    });
  }
};


// Controller untuk melaporkan artikel
const reportArtikel = async (req, res, next) => {
  try {
    const { artikelId } = req.params;
    const userId = req.user?.id; // Mengambil userId dari req.user
    const { alasan } = req.body;

    const existingArtikel = await prisma.artikel.findUnique({
      where: { id: parseInt(artikelId) },
    });

    if (!existingArtikel) {
      return res.status(404).json({
        success: false,
        message: 'Artikel not found',
        data: null,
      });
    }

    const reportedArtikel = await prisma.report.create({
      data: {
        alasan,
        artikelId: existingArtikel.id, // Menggunakan artikelId langsung
        userId, // Menggunakan userId langsung
      },
    });

    res.status(201).json({
      success: true,
      message: 'Artikel reported successfully',
      data: reportedArtikel,
    });
  } catch (error) {
    console.error('Error reporting artikel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report artikel',
      error: error.message,
      data: null,
    });
  }
};

// Controller untuk memberi peringkat pada artikel
const rateArtikel = async (req, res, next) => {
  try {
    const { artikelId } = req.params;
    const userId = req.user?.id; // Mengambil userId dari req.user
    const { nilai } = req.body;

    const existingArtikel = await prisma.artikel.findUnique({
      where: { id: parseInt(artikelId) },
    });

    if (!existingArtikel) {
      return res.status(404).json({
        success: false,
        message: 'Artikel not found',
        data: null,
      });
    }

    const ratedArtikel = await prisma.rating.create({
      data: {
        nilai,
        artikelId: existingArtikel.id, // Menggunakan artikelId langsung
        userId, // Menggunakan userId langsung
      },
    });

    res.status(201).json({
      success: true,
      message: 'Artikel rated successfully',
      data: ratedArtikel,
    });
  } catch (error) {
    console.error('Error rating artikel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate artikel',
      error: error.message,
      data: null,
    });
  }
};

module.exports = { saveArtikel, reportArtikel, rateArtikel, verifyToken };
