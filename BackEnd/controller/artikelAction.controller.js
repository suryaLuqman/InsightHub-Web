require('dotenv').config();
const jwt = require('jsonwebtoken');
const prisma = require('../libs/prisma');
const { logout, loggedOutTokens } = require('./auth.controllers');

// Middleware untuk mengotentikasi pengguna
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    if (loggedOutTokens.includes(bearerToken)) { // Memeriksa apakah token telah logout
      return res.status(401).json({
        success: false,
        message: "Silahkan login ulang.",
      });
    }
    jwt.verify(bearerToken, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.status(403).json({
          success: false,
          message: "Invalid token",
        });
      } else {
        try {
          // Cek apakah sesi pengguna masih tersedia
          if (!req.session) {
            return res.status(401).json({ success: false, message: "Sesi pengguna tidak ditemukan." });
          }

          // Ambil data sesi pengguna dari database
          const session = await prisma.session.findFirst({
            where: {
              userId: authData.userId, // Memeriksa apakah userId di session sesuai dengan userId yang di-decode dari token
              sid: req.session.sid // Memeriksa apakah sid di session sama dengan sid yang disimpan dalam database
            }
          });

          if (!session) {
            return res.status(401).json({ success: false, message: "Sesi pengguna tidak valid." });
          }

          req.user = authData;
          next();
        } catch (error) {
          console.error("Error during user authentication:", error);
          return res.sendStatus(500);
        }
      }
    });
  } else {
    res.status(403).json({
      success: false,
      message: "Token is missing",
    });
  }
}



// Controller untuk menyimpan artikel
async function saveArtikel(req, res) {
  try {
    const { artikelId } = req.params;
    const userId = req.user?.id;

    if (!artikelId) {
      return res.status(400).json({
        success: false,
        message: "Artikel ID tidak didefinisikan",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID tidak didefinisikan",
      });
    }

    const existingSavedArticle = await prisma.savedArtikel.findFirst({
      where: {
        userId: parseInt(userId),
        artikelId: parseInt(artikelId),
      },
    });

    if (existingSavedArticle) {
      return res.status(400).json({
        success: false,
        message: 'Artikel sudah disimpan sebelumnya',
      });
    }

    const savedArticle = await prisma.savedArtikel.create({
      data: {
        user: { connect: { id: parseInt(userId) } },
        artikel: { connect: { id: parseInt(artikelId) } },
      },
      include: {
        artikel: true,
      },
    });

    const savedArticles = await prisma.savedArtikel.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        artikel: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Artikel berhasil disimpan',
      data: savedArticles,
    });
  } catch (error) {
    console.error('Error saving article:', error);
    if (error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Artikel sudah disimpan sebelumnya',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan dalam menyimpan artikel',
      error: error.message,
    });
  }
}




// Controller untuk mendapatkan artikel yang disimpan oleh pengguna
const getSavedArtikels = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is undefined",
      });
    }

    const savedArtikels = await prisma.savedArtikel.findMany({
      where: { userId: parseInt(userId) },
      include: { artikel: true }, // Sertakan artikel yang terkait dalam respons
    });

    if (!savedArtikels || savedArtikels.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No saved articles found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Saved articles retrieved successfully',
      data: savedArtikels.map(entry => entry.artikel),
    });
  } catch (error) {
    console.error('Error retrieving saved articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve saved articles',
      error: error.message,
      data: null,
    });
  }
};



// Controller untuk melaporkan artikel
const reportArtikel = async (req, res, next) => {
  try {
    const { artikelId } = req.params;
    const userId = req.user?.id;
    const { alasan } = req.body;

    // Periksa apakah pengguna telah melaporkan artikel sebelumnya
    const existingReport = await prisma.report.findFirst({
      where: {
        userId: parseInt(userId),
        artikelId: parseInt(artikelId),
      },
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this article',
      });
    }

    // Buat laporan artikel
    const reportedArtikel = await prisma.report.create({
      data: {
        alasan,
        artikelId: parseInt(artikelId),
        userId: parseInt(userId),
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

    const ratedArtikel = await prisma.rating.findFirst({
      where: {
        userId: parseInt(userId),
        artikelId: parseInt(artikelId),
      },
    });

    if (ratedArtikel) {
      return res.status(400).json({
        success: false,
        message: 'Artikel already rated by this user',
      });
    }

    await prisma.rating.create({
      data: {
        nilai: parseInt(nilai), // Mengonversi nilai ke tipe integer
        artikelId: parseInt(artikelId),
        userId: parseInt(userId),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Artikel rated successfully',
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




module.exports = { saveArtikel, reportArtikel, rateArtikel, verifyToken, getSavedArtikels };
