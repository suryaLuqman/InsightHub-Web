require('dotenv').config();

const Imagekit = require('imagekit');

const {
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT
} = process.env;

const imagekit = new Imagekit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

module.exports = {
  imagekit, // Ekspor imagekit sehingga dapat digunakan di tempat lain
  deleteFile: (fileId) => {
    return new Promise((resolve, reject) => {
      imagekit.deleteFile(fileId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },
};