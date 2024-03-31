require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../libs/prisma');
const nodemailer=require('../libs/nodemailer');
const crypto = require('crypto');
const { imagekit ,deleteFile } = require('../libs/imagekit');
const path = require('path');
const session = require('express-session');
const { createUserSchema,createSUSchema, createAdminSchema, loginSchema ,forgotPasswordSchema, changePasswordSchema} = require('../validation/auth.validations');

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);

    req.user = decoded;
    next();
  });
};



const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { value, error } = await loginSchema.validateAsync({ email, password });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request',
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
        message: 'User not found',
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
              id: user.id
            }
          },
          no_hp: "" // Provide a valid value for `no_hp`
        }
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Wrong email or password',
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
      status:user.status
    };

    const token = jwt.sign(profile, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Inisialisasi objek session jika belum ada
    req.session = req.session || {};

    // Set informasi pengguna ke dalam sesi
    req.session.user = {
      id: user.id,
      email: user.email,
      nama: user.nama,
      token: token,
      // Tambahkan informasi pengguna lainnya yang Anda inginkan
    };

    return res.status(200).json({
      success: true,
      message: 'Login success',
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
        message: 'Bad Request',
        err: 'Missing required fields',
        data: null,
      });
    }

    const { value, error } = await createUserSchema.validateAsync({ email, password, nama, no_hp,status});
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request',
        err: error.message,
        data: null,
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use',
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
        message: 'Failed to register user',
        data: null,
      });
    }

    // Create UserProfile for the new user
    await prisma.userProfile.create({
      data: {
        first_name: nama, // Menggunakan nama sebagai nilai default untuk first_name
        last_name: 'Default', // Menetapkan nilai default untuk last_name
        user: {
          connect: {
            id: newUser.id,
          },
        },
        no_hp: no_hp, // Menggunakan no_hp dari permintaan
        status: status // Menggunakan nilai status dari permintaan
      },
    });

    return res.status(200).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: newUser.id,
        email: newUser.email,
        nama: newUser.nama,
        roles: newUser.roles,
        status:newUser.status
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
        message: 'Bad Request',
        err: 'Missing required fields',
        data: null,
      });
    }

    const { value, error } = await createSUSchema.validateAsync({ email, password, nama});
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request',
        err: error.message,
        data: null,
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use',
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        nama,
        roles: { set: ["USER", "ADMIN", "SUPERADMIN"] }
      },
    });

    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: 'Failed to register user',
        data: null,
      });
    }
    await prisma.userProfile.create({
      data: {
        first_name: nama, // Menggunakan nama sebagai nilai default untuk first_name
        last_name: 'Default', // Menetapkan nilai default untuk last_name
        user: {
          connect: {
            id: newUser.id,
          },
        },
        no_hp: 'null',
        status: 'SUPERADMIN' // Menggunakan nilai status dari permintaan
      },
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { 
        userId: newUser.id, 
        email: newUser.email,
        nama: newUser.nama,
        roles: newUser.roles
      },
    });
  } catch (error) {
    next(error);
  }
};

const registerAdmin = async (req, res, next) => {
  try {
    const { email, password, nama } = req.body;
    const { value, error } = await createAdminSchema.validateAsync({ email, password, nama });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request',
        err: error.message,
        data: null,
      });
    }

    const isAdmin = req.user.roles.includes('SUPERADMIN');
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only superadmin can register admins',
        data: null,
      });
    }

    const existingAdmin = await prisma.user.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin already exists',
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
        last_name: 'Default', // Menetapkan nilai default untuk last_name
        user: {
          connect: {
            id: newAdmin.id,
          },
        },
        no_hp: 'null',
        status: 'ADMIN' // Menggunakan nilai status dari permintaan
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
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
        message: 'User not found',
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
        { expiresIn: '1h' }
      );
      console.log("ini token :", token);
      let url = `http://localhost:3000/api/v1/auth/change-password?token=${token}`;

      let html = `<p>Hi ${user.nama},</p>
      <p>You have requested to change your password.</p>
      <p>Please click on the link below to change your password:</p>
      <a href="${url}">${url}</a>`;
      await nodemailer.sendEmail(email, 'change Password Request', html);

      return res.json({
        status: true,
        message: 'Password change link sent to email successfully',
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

    if (!token) {
      return res.status(400).json({
        status: false,
        message: 'Token is missing!',
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
        message: 'Invalid token!',
        err: err.message,
        data: null,
      });
    }

    const { password, confirm_password } = req.body;

    await changePasswordSchema.validateAsync({ ...req.body });

    if (password !== confirm_password) {
      return res.status(400).json({
        status: false,
        message: 'Password & Confirm_Password do not match!',
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
      message: 'Password updated successfully!',
      err: null,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUser = async (req, res, next) => {
  try {
    const isAdmin = req.user.roles.includes('ADMIN') || req.user.roles.includes('SUPERADMIN');
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only admins can access ',
        data: null,
      });
    }

    const users = await prisma.user.findMany({
      where: {
        NOT: {
          OR: [
            { roles: { has: "ADMIN" } },
            { roles: { has: "SUPERADMIN" } }
          ]
        },
      },
      include: {
        profile: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'All users retrieved successfully',
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
        message: 'User profile not found',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // Ambil ID pengguna yang sedang diautentikasi
    const {first_name, status } = req.body;

    // Jika ada file foto profil yang diunggah
    if (req.file) {
      const strFile = req.file.buffer.toString('base64');
      const hash = crypto.createHash('sha256').update(strFile).digest('hex');
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
      message: 'User profile updated successfully',
      data: updatedProfile,
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  login,
  registerUser,
  registerAdmin,
  authenticateUser,
  registerSU,
  changePassword,
  forgotPassword,
  getAllUser,
  getUserProfile,
  updateProfile
};
