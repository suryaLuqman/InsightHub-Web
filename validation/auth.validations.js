const joi = require('joi');

const createAdminSchema = joi.object({
  idAdmin: joi.string().required(),
  password: joi.string().min(6).required(),
});

const loginAdminSchema = joi.object({
  idAdmin: joi.string().required(),
  password: joi.string().min(6).required(),
});


module.exports = {
  createAdminSchema,
  loginAdminSchema,
};