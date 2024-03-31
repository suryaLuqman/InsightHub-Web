require('dotenv').config();
const { imagekit ,deleteFile } = require('../libs/imagekit');
const path = require('path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../libs/prisma');
const { createArtikelSchema } = require('../validation/artikel.validation');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);

    req.user = decoded;
    next();
  });
};

const createArtikel = async (req, res, next) => {
  try {
    const { error, value } = createArtikelSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request!',
        err: error.details[0].message,
        data: null,
      });
    }
    const { judul, deskripsi, link, kategoriId } = value;
    const strFile = req.file.buffer.toString('base64');
    
    const hash = crypto.createHash('sha256').update(strFile).digest('hex');
    
    const { url} = await imagekit.upload({
      fileName: Date.now() + path.extname(req.file.originalname),
      file: strFile,
    });

    const existingArtikel = await prisma.artikel.findFirst({
      where: {
        judul: judul,
      },
    });

    if (existingArtikel) {
      return res.status(400).json({
        status: false,
        message: 'Judul artikel sudah pernah digunakan, mohon gunakan judul lain',
        data: null,
      });
    }

    // Cek apakah hash dari gambar sudah ada dalam database
    const existingHash = await prisma.artikel.findFirst({
      where: {
        fileId: hash,
      },
    });

    if (existingHash) {
      return res.status(400).json({
        status: false,
        message: 'Gambar sudah pernah diunggah sebelumnya',
        data: null,
      });
    }

    const existingKategori = await prisma.kategori.findUnique({
      where: {
        id: parseInt(kategoriId),
      },
    });

    if (!existingKategori) {
      return res.status(404).json({
        status: false,
        message: 'Kategori not found',
        data: null,
      });
    }
    const artikel = await prisma.artikel.create({
      data: {
        author: { connect: { id: req.user.id } },
        judul,
        deskripsi,
        link,
        kategori: { connect: { id:parseInt( kategoriId) } },
        gambar_artikel: url,
        fileId:hash
      }
    });

    if (!artikel) {
      return res.status(400).json({
        status: false,
        message: 'Bad Request!',
        err: 'Failed to create article',
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: 'OK!',
      err: null,
      data: { artikel },
    });
  } catch (err) {
    next(err);
  }
};


// Read Artikel
const getAllArtikel = async (req, res, next) => {
  try {
    const allArtikel = await prisma.artikel.findMany({
      include: {
        ratings: true
      }
    });

    // Mendapatkan nilai-nilai rating dari setiap artikel
    const artikelWithAvgRatings = allArtikel.map(artikel => {
      if (artikel.gambar_artikel === null) {
      // Skip processing for articles with null gambar_artikel
      return artikel;
    }
      const ratings = artikel.ratings.map(rating => rating.nilai);
      const avgRating = ratings.length ? ratings.reduce((acc, curr) => acc + curr) / ratings.length : 0;
      return { ...artikel, avgRating };
    });

    res.status(200).json({
      success: true,
      message: 'All Artikel retrieved successfully',
      data: artikelWithAvgRatings,
    });
  } catch (error) {
    next(error);
  }
};



// Update Artikel
const updateArtikel = async (req, res, next) => {
  try {
    console.log(req.body);
    const { artikelId } = req.params;
    if (!artikelId) {
      return res.status(400).json({
        status: false,
        message: 'artikelId diperlukan',
        data: null,
      });
    }
    const { judul, deskripsi, link, kategoriId } = req.body;
    if (!kategoriId) {
      return res.status(400).json({
        status: false,
        message: 'kategoriId diperlukan',
        data: null,
      });
    }

    // Cek apakah judul sudah digunakan oleh artikel lain
    const existingJudul = await prisma.artikel.findFirst({
      where: {
        judul: judul,
        NOT: {
          id: parseInt(artikelId),
        },
      },
    });

    if (existingJudul) {
      return res.status(400).json({
        status: false,
        message: 'Judul sudah digunakan oleh artikel lain',
        data: null,
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

    // Jika ada file yang diunggah
    if (req.file) {
      const strFile = req.file.buffer.toString('base64');
      const hash = crypto.createHash('sha256').update(strFile).digest('hex');
      const { url } = await imagekit.upload({
        fileName: Date.now() + path.extname(req.file.originalname),
        file: strFile,
      });

      // Cek apakah hash dari gambar sudah ada dalam database dan digunakan oleh artikel lain
      const existingHash = await prisma.artikel.findFirst({
        where: {
          fileId: hash,
          NOT: {
            id: parseInt(artikelId),
          },
        },
      });

      if (existingHash) {
        return res.status(400).json({
          status: false,
          message: 'Gambar sudah digunakan oleh artikel lain',
          data: null,
        });
      }

      // Update gambar dan fileId
      artikel = await prisma.artikel.update({
        where: {
          id: parseInt(artikelId),
        },
        data: {
          judul,
          deskripsi,
          link,
          kategori: { connect: { id: parseInt(kategoriId) } },
          gambar_artikel: url,
          fileId: hash,
        },
      });
    } else {
      // Jika tidak ada file yang diunggah, hanya update judul, deskripsi, link, dan kategoriId
      artikel = await prisma.artikel.update({
        where: {
          id: parseInt(artikelId),
        },
        data: {
          judul,
          deskripsi,
          link,
          kategori: { connect: { id: parseInt(kategoriId) } },
        },
      });
    }

    if (!artikel) {
      return res.status(400).json({
        status: false,
        message: 'Failed to update article',
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Article updated successfully',
      data: { artikel },
    });
  } catch (err) {
    next(err);
  }
};


// Delete Artikel
const deleteArtikel = async (req, res, next) => {
  try {
    const artikelId = parseInt(req.params.artikelId);
    const userId = req.user.id;

    // Periksa apakah artikel ada dan apakah pengguna yang menghapus artikel adalah penulis atau admin
    const artikel = await prisma.artikel.findUnique({
      where: {
        id: artikelId,
      },
      include: {
        author: true,
        savedArtikels: true, // Memuat relasi dengan savedArtikels
        ratings: true,
        reports: true,
      },
    });

    if (!artikel) {
      return res.status(404).json({
        status: false,
        message: 'Artikel not found',
        data: null,
      });
    }

    // Cek otorisasi
    if (artikel.authorId !== userId && req.user.roles.indexOf('ADMIN') === -1 && req.user.roles.indexOf('SUPERADMIN') === -1) {
      return res.status(403).json({
        status: false,
        message: 'Unauthorized to delete this article',
        data: null,
      });
    }
    
    // Hapus artikel bersama dengan data terkait
    await prisma.artikel.delete({
      where: {
        id: artikelId,
      },
      include: {
        savedArtikels: true, // Memuat relasi dengan savedArtikels
        ratings: true,
        reports: true,
      },
    });

    return res.status(200).json({
      status: true,
      message: 'Article deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};



module.exports = {
  createArtikel,
  getAllArtikel,
  updateArtikel,
  deleteArtikel,
  authenticate
};