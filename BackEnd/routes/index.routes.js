const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/artikel', require('./artikel.routes'));

module.exports = router;
