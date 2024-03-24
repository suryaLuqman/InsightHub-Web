const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/artikel', require('./artikel.routes'));
router.use('/kategori', require('./kategori.routes'));
router.use('/search-artikel', require('./search.artikel.routes'));

module.exports = router;
