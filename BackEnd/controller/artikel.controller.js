require('dotenv').config();
const { imagekit ,deleteFile } = require('../libs/imagekit');
const path = require('path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../libs/prisma');
const { createArtikelSchema } = require('../validation/artikel.validation');
const authenticateUser = require('./auth.controllers');


// Middleware untuk memeriksa apakah pengguna sudah logout
const checkLogoutStatus = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (req.loggedOutTokens && req.loggedOutTokens.includes(token)) {
    return res.status(401).json({ success: false, message: "Silahkan login ulang." });
  }
  next();
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

    let url;
    let hash;

    if (req.file) {
      const strFile = req.file.buffer.toString('base64');
      hash = crypto.createHash('sha256').update(strFile).digest('hex');
      
      const { url: imageUrl } = await imagekit.upload({
        fileName: Date.now() + path.extname(req.file.originalname),
        file: strFile,
      });

      url = imageUrl;
    }

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

    if (hash) {
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
    }

    const existingKategori = await prisma.kategori.findMany({
      where: {
        id: { in: Array.isArray(kategoriId) ? kategoriId.map(id => parseInt(id)) : [parseInt(kategoriId)] },
      },
    });

    if (existingKategori.length !== (Array.isArray(kategoriId) ? kategoriId.length : 1)) {
      return res.status(404).json({
        status: false,
        message: 'One or more categories not found',
        data: null,
      });
    }

    const artikel = await prisma.artikel.create({
      data: {
        author: { connect: { id: req.user.id } }, // Menghubungkan artikel dengan penulis berdasarkan ID pengguna
        judul,
        deskripsi,
        link,
        kategori: { connect: existingKategori.map(kategori => ({ id: kategori.id })) },
        gambar_artikel: url || null,
        fileId: hash || null,
      },
      include: {
        kategori: true, 
        author: true // Sertakan informasi penulis dalam respons
      },
    });

    if (!artikel) {
      return res.status(400).json({
        status: false,
        message: 'Failed to create article',
        data: null,
      });
    }
    const authorInfo = await prisma.userProfile.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        first_name: true,
        profile_picture: true
        // Tambahkan properti lainnya seperti last_name jika diperlukan
      },
    });
    return res.status(200).json({
      status: true,
      message: 'Article created successfully',
      data: { 
        artikel: {
          ...artikel,
          kategoriId: existingKategori.map(kategori => kategori.id),
          author: authorInfo 
        }
      },
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
        ratings: true,
        kategori: true // Sertakan kategori dalam hasil query
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
      
      // Mengecek apakah artikel memiliki kategori sebelum memetakan ID kategori
      const kategoriId = artikel.kategori ? artikel.kategori.map(kategori => kategori.id) : [];
      
      return { ...artikel, avgRating, kategoriId };
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

    // Ambil informasi penulis
    const authorInfo = await prisma.userProfile.findUnique({
      where: {
        id: req.user.id
      },
      select: {
        first_name: true // Tambahkan properti lain jika diperlukan
      }
    });
    // Ambil artikel yang ada berdasarkan artikelId
    const existingArtikel = await prisma.artikel.findUnique({
      where: { id: parseInt(artikelId) },
    });

    // Jika artikel tidak ditemukan
    if (!existingArtikel) {
      return res.status(404).json({
        success: false,
        message: 'Artikel not found',
        data: null,
      });
    }
    // Jika judul baru sama dengan judul yang sudah ada sebelumnya atau tidak ada perubahan pada judul, lanjutkan dengan proses update
    if (judul === existingArtikel.judul || judul === null) {
      const updatedArtikel = await prisma.artikel.update({
        where: { id: parseInt(artikelId) },
        data: {
          judul: existingArtikel.judul, // Tetap gunakan judul yang sama
          deskripsi,
          link,
          kategori: { connect: { id: parseInt(kategoriId) } },
        },
        include: { kategori: true },
      });

      return res.status(200).json({
        status: true,
        message: 'Article updated successfully',
        data: {
          artikel: {
            ...updatedArtikel,
            kategoriId: updatedArtikel.kategori.map(kategori => kategori.id),
          },
        },
      });
    }

    // Jika judul baru berbeda dengan judul yang sudah ada sebelumnya, lakukan validasi lebih lanjut
    const existingJudul = await prisma.artikel.findFirst({
      where: {
        judul: judul,
        NOT: {
          id: parseInt(artikelId),
        },
      },
    });

    // Jika judul sudah digunakan oleh artikel lain, kembalikan pesan kesalahan
    if (existingJudul) {
      return res.status(400).json({
        status: false,
        message: 'Judul sudah digunakan oleh artikel lain',
        data: null,
      });
    }
      // Lakukan update artikel dengan judul yang baru
      await prisma.artikel.update({
        where: { id: parseInt(artikelId) },
        data: {
          judul,
          deskripsi,
          link,
          kategori: { connect: { id: parseInt(kategoriId) } },
        },
        include: { kategori: true },
      });
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
          kategori: { connect: kategoriId.map(id => ({ id: parseInt(id) })) },
          gambar_artikel: url,
          fileId: hash,
          kategori: { connect: { id: parseInt(kategoriId) } },
        },
        include: {
          kategori: true, 
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
        include: {
          kategori: true, 
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
      data: { 
        artikel: {
          ...artikel,
          kategoriId: artikel.kategori.map(kategori => kategori.id),
          author: authorInfo // Menambahkan kategoriId ke dalam data artikel
        }
      },
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

    // Hapus semua entri yang terkait dari tabel savedArtikels jika data tersedia
    if (artikel.savedArtikels && artikel.savedArtikels.length > 0) {
      await prisma.savedArtikel.deleteMany({
        where: {
          artikelId: artikelId,
        },
      });
    }

    // Hapus semua rating yang terkait dengan artikel yang akan dihapus
    if (artikel.ratings && artikel.ratings.length > 0) {
      await prisma.rating.deleteMany({
        where: {
          artikelId: artikelId,
        },
      });
    }

    // Hapus semua laporan yang terkait dengan artikel yang akan dihapus
    if (artikel.reports && artikel.reports.length > 0) {
      await prisma.report.deleteMany({
        where: {
          artikelId: artikelId,
        },
      });
    }

    // Hapus artikel
    await prisma.artikel.delete({
      where: {
        id: artikelId,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
      data: null,
    });
  } catch (err) {
    console.error('Error deleting article:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete article',
      data: null,
    });
  }
};




module.exports = {
  createArtikel,
  getAllArtikel,
  updateArtikel,
  deleteArtikel,
  authenticateUser,
  checkLogoutStatus
};