const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Function untuk memeriksa sesi
exports.checkSession = async (userId) => {
  try {
    // Cari sesi terbaru berdasarkan userId
    const sessions = await prisma.session.findMany({
      where: { userId: Number(userId) },
      orderBy: { expire: 'desc' },
    });

    console.log("sessions:", sessions);
    // Jika tidak ada sesi atau sesi telah kadaluarsa, kembalikan false
    if (!sessions || sessions.length === 0 || sessions[0].expire < new Date()) {
      return false;
    }

    // Jika ada sesi yang masih berlaku, kembalikan true
    return sessions[0];
  } catch (error) {
    throw new Error(`Error checking session: ${error.message}`);
  }
};
