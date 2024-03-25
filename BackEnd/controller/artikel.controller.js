require('dotenv').config();
const prisma = require('../libs/prisma');

// Create Artikel
const createArtikel = async (req, res, next) => {
  try {
    const { judul, deskripsi, link, gambar_artikel, kategoriId, authorId } = req.body;

    let missingFields = [];

    if (!judul) missingFields.push("judul");
    if (!deskripsi) missingFields.push("deskripsi");
    if (!link) missingFields.push("link");
    if (!kategoriId) missingFields.push("kategoriId");
    if (!authorId) missingFields.push("authorId");

    // Jika ada field yang hilang, kembalikan error dengan detail field yang hilang.
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        data: missingFields,
      });
    }

    const existingArtikel = await prisma.artikel.findFirst({
      where: {
        judul: judul,
      },
    });

    // Periksa apakah gambar_artikel telah digunakan sebelumnya
    const existingArtikelWithSameImage = await prisma.artikel.findFirst({
      where: {
        gambar_artikel,
      },
    });
    

    if (existingArtikel) {
      return res.status(400).json({
        success: false,
        message: 'Judul artikel sudah ada, harap gunakan judul yang berbeda',
        data: null,
      });
    }

    // Jika artikel dengan gambar yang sama ditemukan, kirim respons dengan pesan kesalahan
    if (existingArtikelWithSameImage) {
      return res.status(400).json({
        success: false,
        message: 'Gambar sudah digunakan oleh artikel lain. Harap gunakan gambar orisinal.',
        data: null,
      });
    }

    const existingKategori = await prisma.kategori.findUnique({
      where: {
        id: kategoriId,
      },
    });

    if (!existingKategori) {
      return res.status(400).json({
        success: false,
        message: 'Invalid kategoriId',
        data: null,
      });
    }

    const newArtikel = await prisma.artikel.create({
      data: {
        judul,
        deskripsi,
        link,
        gambar_artikel,
        kategoriId,
        authorId,
      },
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

    const existingArtikel = await prisma.artikel.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existingArtikel) {
      return res.status(404).json({
        success: false,
        message: 'Artikel tidak ditemukan',
        data: null,
      });
    }

    // Periksa judul jika akan diubah dan apakah judul tersebut sudah digunakan oleh artikel lain
    if (judul !== existingArtikel.judul) {
      const artikelWithSameJudul = await prisma.artikel.findFirst({
        where: {
          judul: judul,
          NOT: {
            id: parseInt(id),
          },
        },
      });

      if (artikelWithSameJudul) {
        return res.status(400).json({
          success: false,
          message: 'Judul artikel sudah ada, harap gunakan judul yang berbeda',
          data: null,
        });
      }
    }

    // Periksa gambar jika akan diubah dan apakah gambar tersebut sudah digunakan oleh artikel lain
    if (gambar_artikel !== existingArtikel.gambar_artikel) {
      const artikelWithSameImage = await prisma.artikel.findFirst({
        where: {
          gambar_artikel: gambar_artikel,
          NOT: {
            id: parseInt(id),
          },
        },
      });

      if (artikelWithSameImage) {
        return res.status(400).json({
          success: false,
          message: 'Gambar sudah digunakan oleh artikel lain. Harap gunakan gambar orisinal.',
          data: null,
        });
      }
    }

    // Melanjutkan proses update jika tidak ada masalah
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
        authorId,
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
      message: 'Artikel berhasil dihapus',
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