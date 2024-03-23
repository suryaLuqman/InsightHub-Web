const router = require('express').Router();
const { loginAdmin,  createAdmin } = require('../controller/auth.controllers');

router.post('/admin/login', loginAdmin);
router.post('/admin/register', createAdmin);
module.exports = router;
