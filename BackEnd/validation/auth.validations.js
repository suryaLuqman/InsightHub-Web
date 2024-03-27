const joi = require('joi');

const createUserSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  username: joi.string().required(),
  no_hp: joi.string().required(),
});

const createAdminSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  nama: joi.string().required(),
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});
const forgotPasswordSchema = joi.object({
  email: joi.string().email().required(),
});

const changePasswordSchema = joi.object({
  password: joi.string().min(6).required(),
  confirm_password: joi.string().min(6).required(),
});

const createArtikelSchema = joi.object({
  judul: joi.string().required(),
  deskripsi: joi.string().required(),
  link: joi.string().required(),
  kategoriId: joi.number().required(),
  file: joi.object({
    mimetype: joi.string().valid('image/jpeg', 'image/png').required(),
    buffer: joi.binary().required()
  }).required()
});

module.exports = {
  createUserSchema,
  createAdminSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  createArtikelSchema
};
