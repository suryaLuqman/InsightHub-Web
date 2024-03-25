require('dotenv').config();
const prisma = require('../libs/prisma');

const createKategori = async (req, res, next) => {
  const { nama, deskripsi } = req.body;
  try {
    // Check for duplicate category name
    const existingKategori = await prisma.kategori.findFirst({
      where: {
        nama: nama,
      },
    });

    if (existingKategori) {
      return res.status(409).json({ message: "Kategori sudah ada." });
    }

    // Create a new category if it doesn't exist
    const newKategori = await prisma.kategori.create({
      data: {
        nama,
        deskripsi,
      },
    });

    res.status(201).json({success: true, message: "Kategori berhasil dibuat.", data: newKategori });

  } catch (error) {
    next(error);
  }
};


const getAllKategori = async (req, res) => {
    try {
        const kategoris = await prisma.kategori.findMany();
        res.json(kategoris);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const deleteKategori = async (req, res) => {
    const { id } = req.params;
    try {
        // Cek apakah kategori dengan ID tersebut ada
        const existingKategori = await prisma.kategori.findUnique({
            where: { id: Number(id) },
        });

        // Jika kategori tidak ditemukan, kirim pesan error
        if (!existingKategori) {
            return res.status(404).json({ success: false, message: 'Kategori yang ingin dihapustidak ada' });
        }

        // Jika kategori ditemukan, lanjutkan dengan penghapusan
        await prisma.kategori.delete({
            where: { id: Number(id) },
        });
        res.json({ success: true, message: 'Kategori berhasil di hapus' });
    } catch (error) {
        res.status(500).send(error.message);
    }
};




module.exports = {
    createKategori,
    getAllKategori,
    deleteKategori
};