require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../libs/prisma');
const nodemailer=require('../libs/nodemailer');
const socketIO= require('socket.io');
const socketHandler = require ('../libs/socketHandler');
const { createUserSchema, createAdminSchema, loginSchema ,forgotPasswordSchema, changePasswordSchema} = require('../validation/auth.validations');

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
      name: user.username,
      email: user.email,
      roles: user.roles,
      profile: user.profile,
    };

    const token = jwt.sign(profile, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    const notificationData = {
      type: 'login',
      message: 'Selamat, berhasil login',
    };

    socketHandler.emitNotification(notificationData);

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
    const { email, password, username, no_hp } = req.body;
    if (!email || !password || !username || !no_hp) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request',
        err: 'Missing required fields',
        data: null,
      });
    }

    const { value, error } = await createUserSchema.validateAsync({ email, password, username, no_hp });
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
      data: { email, password: hashedPassword, username },
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
        first_name: username, // Assuming username is the first name
        last_name: 'Default', // Add a default value for last_name
        user: {
          connect: {
            id: newUser.id,
          },
        },
        no_hp: no_hp, // Include provided phone number
      },
    });

    const notificationData = {
      type: 'registration',
      message: 'Selamat, akun baru sudah dibuat. Silahkan login',
    };

    socketHandler.emitNotification(notificationData);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
        roles: newUser.roles,
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

    const { value, error } = await createUserSchema.validateAsync({ email, password, nama });
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
        roles: { set: ["USER", "ADMIN", "SUPERADMIN"] },
      },
    });

    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: 'Failed to register user',
        data: null,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { 
        userId: newUser.id, 
        email: newUser.email,
        nama: newUser.username,
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
    
        const changePasswordLink = `http://localhost:3000/api/v1/auth/change-password?token=<%= token %>${token}`;
        const html = await nodemailer.getHtml('change-password-email.ejs', { changePasswordLink });
        await nodemailer.sendEmail(email, 'Change Password', html);
       
        const notificationData = {
          type: 'forgotPassword',
          message: 'Password reset link sudah terkirim ke email, silahkan di cek',
        };
  
        socketHandler.emitNotification(notificationData);

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
        id: decoded.id,
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



module.exports = {
  login,
  registerUser,
  registerAdmin,
  authenticateUser,
  registerSU,
  changePassword,
  forgotPassword
};
