require('dotenv').config();
const prisma = require('../libs/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createAdminSchema, loginAdminSchema} = require('../validation/auth.validations');


const loginAdmin = async (req, res, next) => {
  try {
    const { idAdmin, password } = req.body;

    const { value, error } = await loginAdminSchema.validateAsync({
      idAdmin,
      password,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request',
        err: error.message,
        data: null,
      });
    }

    const admin = await prisma.admin.findUnique({
      where: {
        idAdmin: idAdmin,
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Wrong id or Password',
        data: null,
      });
    }

    const payload = {
      id: admin.id,
      idAdmin: admin.idAdmin,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.status(200).json({
      success: true,
      message: 'Login success',
      data: token,
    });
  } catch (error) {
    next(error);
  }
};


const createAdmin = async (req, res, next) => {
  try {
    console.log(req.body);
    const { idAdmin, password } = req.body;

    const { value, error } = await createAdminSchema.validateAsync({
      idAdmin,
      password,
    });

    const admin = await prisma.admin.findUnique({
      where: {
        idAdmin: idAdmin,
      },
    });

    if (admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin already exists',
        data: null,
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: {
        idAdmin,
        password: encryptedPassword,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Created Successfully!',
      data: newAdmin,
    });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  loginAdmin,
  createAdmin,
};
