require('dotenv').config();
const prisma = require('../libs/prisma');
// Create Artikel
const createArtikel = async (req, res, next) => {
  try {
    const { judul, deskripsi, link, gambar_artikel, kategoriId, authorId } = req.body;

    const newArtikel = await prisma.artikel.create({
      data: {
        judul,
        deskripsi,
        link,
        gambar_artikel,
        kategoriId,
        authorId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Artikel created successfully',
      data: newArtikel,
    });
  } catch (error) {
    next(error);
  }
};

// Read Artikel
const getAllArtikel = async (req, res, next) => {
  try {
    const allArtikel = await prisma.artikel.findMany();

    res.status(200).json({
      success: true,
      message: 'All Artikel retrieved successfully',
      data: allArtikel,
    });
  } catch (error) {
    next(error);
  }
};

// Update Artikel
const updateArtikel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { judul, deskripsi, link, gambar_artikel, kategoriId, authorId } = req.body;

    const updatedArtikel = await prisma.artikel.update({
      where: {
        id: parseInt(id),
      },
      data: {
        judul,
        deskripsi,
        link,
        gambar_artikel,
        kategoriId,
        authorId
      },
    });

    res.status(200).json({
      success: true,
      message: 'Artikel updated successfully',
      data: updatedArtikel,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Artikel
const deleteArtikel = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.artikel.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Artikel deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createArtikel,
  getAllArtikel,
  updateArtikel,
  deleteArtikel,
};