const router = require('express').Router();
router.get('/index', (req, res) => {
    res.render('index');
});
router.use('/auth', require('./auth.routes'));
router.use('/artikel', require('./artikel.routes'));
router.use('/kategori', require('./kategori.routes'));
router.use('/search-artikel', require('./search.artikel.routes'));
router.use('/artikel', require('./artikelAction.routes'));


module.exports = router;
