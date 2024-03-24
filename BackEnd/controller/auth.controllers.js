require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../libs/prisma');
const { createUserSchema, createAdminSchema, loginSchema } = require('../validation/auth.validations');


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403); // Invalid token or expired token

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
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
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

    const payload = {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    var profile = user;
    // console.log({ profile });

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
      data: { email, password: hashedPassword, nama },
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
        nama: newUser.nama,
        roles: newUser.roles
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
    console.log("ini req body", req.body);
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

module.exports = {
  login,
  registerUser,
  registerAdmin,
  authenticateToken,
  registerSU
};
