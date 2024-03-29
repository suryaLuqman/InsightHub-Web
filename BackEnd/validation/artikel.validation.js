const joi = require('joi');

const createArtikelSchema = joi.object({
  judul: joi.string().required(),
  deskripsi: joi.string().required(),
  link: joi.string().required(),
  kategoriId: joi.number().required()
});

module.exports = {
  createArtikelSchema
};