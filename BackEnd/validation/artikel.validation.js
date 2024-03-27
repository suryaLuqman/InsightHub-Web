const joi = require('joi');

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
  createArtikelSchema
};