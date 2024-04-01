const joi = require('joi');

const createArtikelSchema = joi.object({
  judul: joi.string().required(),
  deskripsi: joi.string().required(),
  link: joi.string().required(),
  kategoriId: joi.alternatives().try(
    joi.array().items(joi.string()).min(1), 
    joi.string() 
  ).required(),
});

module.exports = {
  createArtikelSchema
};