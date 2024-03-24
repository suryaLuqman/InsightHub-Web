const joi = require('joi');

const createUserSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  nama: joi.string().required(),
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

const resetPasswordSchema = joi.object({
  password: joi.string().min(6).required(),
  confirm_password: joi.string().min(6).required(),
});

module.exports = {
  createUserSchema,
  createAdminSchema,
  loginSchema,
  resetPasswordSchema,
  forgotPasswordSchema
};
