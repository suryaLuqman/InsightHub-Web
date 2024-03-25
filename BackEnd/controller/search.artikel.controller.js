require('dotenv').config();
const prisma = require('../libs/prisma');

const searchArtikel = async (req, res, next) => {
  try {
    const { kategori, judul, authorId } = req.query;
    let searchConditions = {};

    if (kategori) {
      searchConditions.kategori = {
        nama: {
          contains: kategori,
          mode: 'insensitive', // Case-insensitive
        },
      };
    }

    if (judul) {
      searchConditions.judul = {
        contains: judul,
        mode: 'insensitive', // Case-insensitive
      };
    }

    if (authorId) {
      searchConditions.authorId = parseInt(authorId);
    }

    const artikel = await prisma.artikel.findMany({
      where: searchConditions,
      include: {
        kategori: true,
        author: true,
      },
    });

    res.json(artikel);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchArtikel,
};