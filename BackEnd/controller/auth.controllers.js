const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../libs/prisma");
const nodemailer = require("../libs/nodemailer");
require("dotenv").config();
const crypto = require("crypto");
const { imagekit, deleteFile } = require("../libs/imagekit");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const {
  createUserSchema,
  createSUSchema,
  createAdminSchema,
  loginSchema,
  forgotPasswordSchema,
  changePasswordSchema,
} = require("../validation/auth.validations");
const { Console } = require("console");

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) return res.sendStatus(401);

  // Verifikasi apakah token ada dalam daftar token yang sudah logout
  if (loggedOutTokens.includes(token)) {
    return res.status(401).json({ success: false, message: "Silahkan login ulang." });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: "Token telah kedaluwarsa." });
      }
      return res.sendStatus(403);
    }

    try {
      // Cek apakah sesi pengguna masih tersedia
      if (!req.session) {
        return res.status(401).json({ success: false, message: "Sesi pengguna tidak ditemukan." });
      }

      // Ambil data sesi pengguna dari database
      const session = await prisma.session.findFirst({
        where: {
          userId: decoded.userId, // Memeriksa apakah userId di session sesuai dengan userId yang di-decode dari token
          sid: req.session.sid // Memeriksa apakah sid di session sama dengan sid yang disimpan dalam database
        }
      });

      if (!session) {
        return res.status(401).json({ success: false, message: "Sesi pengguna tidak valid." });
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error("Error during user authentication:", error);
      return res.sendStatus(500);
    }
  });
};



const loggedOutTokens = []; // Simpan token yang sudah logout di sini

const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      // Tambahkan token ke daftar token yang sudah logout
      loggedOutTokens.push(token);

      // Cari sesi pengguna berdasarkan userId
      const session = await prisma.session.findFirst({
        where: {
          userId: req.session.userId // Menggunakan userId dari sesi yang disimpan saat login
        }
      });

      if (session) {
        console.log("Found session:", session);
        console.log("Session sid before deletion:", session.sid);
        // Hapus sesi jika ditemukan
        await prisma.session.delete({
          where: {
            sid: session.sid
          }
        });
        console.log("Session deleted:", session);
      } else {
        console.log("Session not found for userId:", req.session.userId);
      }
    }
    // Hapus cookie session
    req.session.destroy(async (err) => {
      if (err) {
        return next(err);
      }

      // Bersihkan cookie
      res.clearCookie('connect.sid');

      // Redirect atau kirim response sesuai kebutuhan Anda
      res.status(200).json({
        success: true,
        message: "Logout success",
        data: null,
      });
    });
  } catch (error) {
    console.error("Error during logout:", error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { value, error } = await loginSchema.validateAsync({
      email,
      password,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        profile: true, // Include UserProfile data
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    // Check if user already has a profile
    if (!user.profile) {
      // If UserProfile doesn't exist, create a new UserProfile
      const newProfile = await prisma.userProfile.create({
        data: {
          first_name: "Default",
          last_name: "Profile",
          user: {
            connect: {
              id: user.id,
            },
          },
          no_hp: "", // Provide a valid value for `no_hp`
        },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Wrong email or password",
        data: null,
      });
    }
    // Include user ID in the profile object
    const profile = {
      id: user.id,
      name: user.nama,
      email: user.email,
      roles: user.roles,
      profile: user.profile,
    };

    const token = jwt.sign(profile, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Inisialisasi objek session jika belum ada
    req.session = req.session || {};

    // Set informasi pengguna ke dalam sesi
    req.session.user = {
      id: user.id,
      email: user.email,
      nama: user.nama,
      token: token,
      status: profile.profile.status,
      // Tambahkan informasi pengguna lainnya yang Anda inginkan
    };

    // Simpan session ke dalam database
    // Cek apakah session untuk pengguna ini sudah ada
    let existingSession = await prisma.session.findUnique({
      where: { sid: req.sessionID },
    });

    if (existingSession) {
      // Jika session sudah ada, lakukan update
      await prisma.session.update({
        where: { sid: req.sessionID },
        data: {
          expire: req.session.cookie._expires,
          sess: req.session,
          userId: user.id, // tambahkan userId di sini jika perlu
        },
      });
    } else {
      // Jika session belum ada, buat session baru
      // Simpan session ke dalam database
      await prisma.session.create({
        data: {
          sid: req.sessionID,
          userId: user.id,
          expire: req.session.cookie._expires,
          sess: req.session,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login success",
      data: {
        token: token,
        profile: profile,
      },
    });
  } catch (error) {
    next(error);
  }
};



const registerUser = async (req, res, next) => {
  try {
    const { email, password, nama, no_hp, status } = req.body; // Tambahkan status di sini jika ada

    // Pastikan tidak ada data yang kosong
    if (!email || !password || !nama || !no_hp || !status) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        err: "Missing required fields",
        data: null,
      });
    }

    const { value, error } = await createUserSchema.validateAsync({
      email,
      password,
      nama,
      no_hp,
      status,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, nama },
    });

    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to register user",
        data: null,
      });
    }

    // Create UserProfile for the new user
    await prisma.userProfile.create({
      data: {
        first_name: nama, // Menggunakan nama sebagai nilai default untuk first_name
        last_name: "Default", // Menetapkan nilai default untuk last_name
        user: {
          connect: {
            id: newUser.id,
          },
        },
        no_hp: no_hp, // Menggunakan no_hp dari permintaan
        status: status, // Menggunakan nilai status dari permintaan
      },
    });

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      data: {
        userId: newUser.id,
        email: newUser.email,
        nama: newUser.nama,
        roles: newUser.roles,
        status: newUser.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const registerSU = async (req, res, next) => {
  try {
    const { email, password, nama } = req.body;
    // console.log("ini req body", req.body);
    if (!email || !password || !nama) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        err: "Missing required fields",
        data: null,
      });
    }

    const { value, error } = await createSUSchema.validateAsync({
      email,
      password,
      nama,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nama,
        roles: { set: ["USER", "ADMIN", "SUPERADMIN"] },
      },
    });

    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to register user",
        data: null,
      });
    }
    await prisma.userProfile.create({
      data: {
        first_name: nama, // Menggunakan nama sebagai nilai default untuk first_name
        last_name: "Default", // Menetapkan nilai default untuk last_name
        user: {
          connect: {
            id: newUser.id,
          },
        },
        no_hp: "null",
        status: "SUPERADMIN", // Menggunakan nilai status dari permintaan
      },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        userId: newUser.id,
        email: newUser.email,
        nama: newUser.nama,
        roles: newUser.roles,
      },
    });
  } catch (error) {
    next(error);
  }
};

const registerAdmin = async (req, res, next) => {
  try {
    const { email, password, nama } = req.body;
    const { value, error } = await createAdminSchema.validateAsync({
      email,
      password,
      nama,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Bad Request",
        err: error.message,
        data: null,
      });
    }

    const isAdmin = req.user.roles.includes("SUPERADMIN");
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only superadmin can register admins",
        data: null,
      });
    }

    const existingAdmin = await prisma.user.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists",
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nama,
        roles: { set: ["USER", "ADMIN"] },
      },
    });
    await prisma.userProfile.create({
      data: {
        first_name: nama, // Menggunakan nama sebagai nilai default untuk first_name
        last_name: "Default", // Menetapkan nilai default untuk last_name
        user: {
          connect: {
            id: newAdmin.id,
          },
        },
        no_hp: "null",
        status: "ADMIN", // Menggunakan nilai status dari permintaan
      },
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: { adminId: newAdmin.id },
    });
  } catch (error) {
    next(error);
  }
};
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    await forgotPasswordSchema.validateAsync({ ...req.body });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
        err: null,
        data: null,
      });
    } else {
      const token = jwt.sign(
        {
          id: user.id,
          name: user.nickname,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      console.log("ini token :", token);
      const baseUrl = process.env.API;
      console.log("ini base url :", baseUrl);
      const url = `http://localhost:3000/change-password?token=${token}`;

      // Read the HTML template from the file
      // const templatePath = 'reset_password_template.html';
      // const templateContent = fs.readFileSync(templatePath, 'utf8');
      console.log("forgot passsword berhasil");
      // Replace placeholders with actual values
      let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password</title>
          
          <!-- Bootstrap CSS -->
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
          
          <!-- Font Awesome CSS -->
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
          
          <style>
            body {
              background: #f5f5f5;
              font-family: Arial, sans-serif;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #ffffff;
              border-radius: 10px;
              box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
            }
            .email-header {
              text-align: center;
              padding: 20px 0;
            }
            .email-header img {
              width: 70px;
            }
            .email-body {
              padding: 20px;
              font-size: 16px;
              line-height: 1.5;
              color: #333;
              text-align: center;
            }
            .email-body a {
              display: inline-block;
              padding: 10px 20px;
              margin: 20px 0;
              color: #ffffff;
              background: #007bff;
              border-radius: 5px;
              text-decoration: none;
            }
            .email-footer {
              text-align: center;
              padding: 20px;
              color: #888;
              font-size: 14px;
              border-top: 1px solid #f5f5f5;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaGQcjjiPHoedJa7CBICJOE8COi6QdhA5uW4Hy9jZdPQ&s" alt="Logo">
              <h2>Reset Password</h2>
            </div>
            <div class="email-body">
              <p>Dear ${user.nama},</p>
              <p>You have requested to reset your password. Please click on the button below to reset your password:</p>
              <a href="${url}" class="btn btn-primary">Reset Password</a>
              <p>If you did not request this, please ignore this email.</p>
            </div>
            <div class="email-footer">
              <p>© 2024 InsightHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>`;

      await nodemailer.sendEmail(email, "Reset Password Request", html);

      return res.json({
        status: true,
        message: "Password reset link sent to email successfully",
        err: null,
        data: null,
      });
    }
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    console.log("token:", token);
    console.log("ini req.body:", req.body);

    if (!token) {
      return res.status(400).json({
        status: false,
        message: "Token is missing!",
        err: null,
        data: null,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        status: false,
        message: "Invalid token!",
        err: err.message,
        data: null,
      });
    }

    const { password, confirm_password } = req.body;

    await changePasswordSchema.validateAsync({ ...req.body });

    if (password !== confirm_password) {
      return res.status(400).json({
        status: false,
        message: "Password & Confirm_Password do not match!",
        err: null,
        data: null,
      });
    }

    await prisma.user.update({
      where: {
        email: decoded.email,
      },
      data: {
        password: await bcrypt.hash(password, 10),
      },
    });

    return res.status(200).json({
      status: true,
      message: "Password updated successfully!",
      err: null,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUser = async (req, res, next) => {
  try {
    const isAdmin =
      req.user.roles.includes("ADMIN") || req.user.roles.includes("SUPERADMIN");
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can access ",
        data: null,
      });
    }

    const users = await prisma.user.findMany({
      where: {
        NOT: {
          OR: [{ roles: { has: "ADMIN" } }, { roles: { has: "SUPERADMIN" } }],
        },
      },
      include: {
        profile: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "All users retrieved successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Temukan profil pengguna
    const userProfile = await prisma.userProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
        data: null,
      });
    }

    // Temukan artikel yang disimpan oleh pengguna
    const savedArtikels = await prisma.savedArtikel.findMany({
      where: {
        userId: userId,
      },
      include: {
        artikel: true,
      },
    });

    // Temukan rating pengguna
    const ratings = await prisma.rating.findMany({
      where: {
        artikel: {
          authorId: userId,
        },
      },
      include: {
        artikel: true,
      },
    });

    // Temukan laporan pengguna
    const reports = await prisma.report.findMany({
      where: {
        artikel: {
          authorId: userId,
        },
      },
      include: {
        artikel: true,
      },
    });

    // Temukan artikel yang dimiliki oleh pengguna
    const userArtikels = await prisma.artikel.findMany({
      where: {
        authorId: userId,
      },
    });

    // Hitung total postingan pengguna
    const totalUserArtikels = userArtikels.length;

    // Hitung total artikel yang dilaporkan oleh pengguna
    const totalReportedArtikels = reports.length;

    // Hitung total rating yang diterima oleh semua artikel pengguna
    const totalRatings = ratings.reduce((acc, curr) => acc + curr.nilai, 0);

    // Hitung rata-rata rating
    const averageRating = totalRatings / ratings.length;

    // Batasi nilai rata-rata agar tidak melebihi 5
    const limitedAverageRating = Math.min(averageRating, 5);

    console.log("totalRatings:", totalRatings);
    console.log("averageRating:", averageRating);
    console.log("limitedAverageRating:", limitedAverageRating);
    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        userProfile: userProfile,
        savedArtikels: savedArtikels,
        ratings: ratings,
        reports: reports,
        userArtikels: userArtikels,
        totalUserArtikels: totalUserArtikels,
        totalReportedArtikels: totalReportedArtikels,
        limitedAverageRating: limitedAverageRating
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // Ambil ID pengguna yang sedang diautentikasi
    const { first_name, status } = req.body;

    // Jika ada file foto profil yang diunggah
    if (req.file) {
      const strFile = req.file.buffer.toString("base64");
      const hash = crypto.createHash("sha256").update(strFile).digest("hex");
      const { url } = await imagekit.upload({
        fileName: Date.now() + path.extname(req.file.originalname),
        file: strFile,
      });

      // Update foto profil dan pictureId
      await prisma.userProfile.update({
        where: {
          userId: userId,
        },
        data: {
          first_name,
          status,
          profile_picture: url,
          pictureId: hash,
        },
      });
    } else {
      // Jika tidak ada file foto profil yang diunggah, hanya update informasi profil
      await prisma.userProfile.update({
        where: {
          userId: userId,
        },
        data: {
          first_name,
          status,
        },
      });
    }

    // Mengambil profil pengguna yang sudah diperbarui
    const updatedProfile = await prisma.userProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: updatedProfile,
    });
  } catch (err) {
    next(err);
  }
};

//deleyte gambar
const deleteProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Mengupdate data gambar profil menjadi null
    await prisma.userProfile.update({
      where: {
        userId: userId,
      },
      data: {
        profile_picture: null,
        pictureId: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile picture deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  loggedOutTokens,
  registerUser,
  registerAdmin,
  authenticateUser,
  registerSU,
  changePassword,
  forgotPassword,
  getAllUser,
  getUserProfile,
  updateProfile,
  deleteProfilePicture,
};
