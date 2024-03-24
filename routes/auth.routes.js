const router = require('express').Router();
const { login, registerUser, registerAdmin,authenticateUser,registerSU , resetPassword,forgotPassword } = require('../controller/auth.controllers');

router.post('/login', login);
router.post('/register/user', registerUser);
router.post('/register/su', registerSU);
router.post('/register/admin', authenticateUser, registerAdmin);
router.post('/forgotPassword', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;