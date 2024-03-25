require('dotenv').config();
const { imagekit } = require('../libs/imagekit');
const path = require('path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../libs/prisma');

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
    const { judul, deskripsi, link, kategoriId } = req.body;
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
    // Cek apakah kategori dengan kategoriId yang diberikan ada dalam database
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
// const updateArtikel = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { judul, deskripsi, link, gambar_artikel, kategoriId, authorId } = req.body;

//     const existingArtikel = await prisma.artikel.findUnique({
//       where: {
//         id: parseInt(id),
//       },
//     });

//     if (!existingArtikel) {
//       return res.status(404).json({
//         success: false,
//         message: 'Artikel tidak ditemukan',
//         data: null,
//       });
//     }

//     // Periksa judul jika akan diubah dan apakah judul tersebut sudah digunakan oleh artikel lain
//     if (judul !== existingArtikel.judul) {
//       const artikelWithSameJudul = await prisma.artikel.findFirst({
//         where: {
//           judul: judul,
//           NOT: {
//             id: parseInt(id),
//           },
//         },
//       });

//       if (artikelWithSameJudul) {
//         return res.status(400).json({
//           success: false,
//           message: 'Judul artikel sudah ada, harap gunakan judul yang berbeda',
//           data: null,
//         });
//       }
//     }

//     // Periksa gambar jika akan diubah dan apakah gambar tersebut sudah digunakan oleh artikel lain
//     if (gambar_artikel !== existingArtikel.gambar_artikel) {
//       const artikelWithSameImage = await prisma.artikel.findFirst({
//         where: {
//           gambar_artikel: gambar_artikel,
//           NOT: {
//             id: parseInt(id),
//           },
//         },
//       });

//       if (artikelWithSameImage) {
//         return res.status(400).json({
//           success: false,
//           message: 'Gambar sudah digunakan oleh artikel lain. Harap gunakan gambar orisinal.',
//           data: null,
//         });
//       }
//     }

//     // Melanjutkan proses update jika tidak ada masalah
//     const updatedArtikel = await prisma.artikel.update({
//       where: {
//         id: parseInt(id),
//       },
//       data: {
//         judul,
//         deskripsi,
//         link,
//         gambar_artikel,
//         kategoriId,
//         authorId,
//       },
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Artikel updated successfully',
//       data: updatedArtikel,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


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
  // updateArtikel,
  deleteArtikel,
  authenticate
};