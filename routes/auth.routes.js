const router = require('express').Router();
const { login, registerUser, registerAdmin,authenticateUser,registerSU } = require('../controller/auth.controllers');

router.post('/login', login);
router.post('/register/user', registerUser);
router.post('/register/su', registerSU);
router.post('/register/admin', authenticateUser, registerAdmin);
module.exports = router;
