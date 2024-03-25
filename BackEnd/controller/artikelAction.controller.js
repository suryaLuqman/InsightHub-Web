require('dotenv').config();
const prisma = require('../libs/prisma');
// Controller untuk menambahkan rating pada artikel
const addRatingToArtikel = async (req, res, next) => {
  try {
    const { artikelId, userId, nilai } = req.body;

    // Cek apakah user sudah memberi rating untuk artikel ini sebelumnya
    const existingRating = await prisma.rating.findFirst({
      where: {
        artikelId: parseInt(artikelId),
        userId: parseInt(userId),
      },
    });

    if (existingRating) {
      // Jika user sudah memberi rating sebelumnya, lakukan update rating
      await prisma.rating.update({
        where: { id: existingRating.id },
        data: { nilai: parseInt(nilai) },
      });
    } else {
      // Jika user belum memberi rating, tambahkan rating baru
      await prisma.rating.create({
        data: {
          artikelId: parseInt(artikelId),
          userId: parseInt(userId),
          nilai: parseInt(nilai),
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rating added successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Controller untuk melaporkan artikel
const reportArtikel = async (req, res, next) => {
  try {
    const { artikelId, userId, alasan } = req.body;

    // Tambahkan laporan baru
    await prisma.report.create({
      data: {
        artikelId: parseInt(artikelId),
        userId: parseInt(userId),
        alasan,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Article reported successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Controller untuk menyimpan artikel
const saveArtikel = async (req, res, next) => {
  try {
    const { artikelId, userId } = req.body;

    // Tambahkan artikel yang disimpan oleh user
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        articles: {
          connect: { id: parseInt(artikelId) },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Article saved successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addRatingToArtikel,
  reportArtikel,
  saveArtikel,
};