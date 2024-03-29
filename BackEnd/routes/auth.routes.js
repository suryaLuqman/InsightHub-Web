const router = require('express').Router();
const { login, registerUser, registerAdmin,authenticateUser,registerSU , changePassword,forgotPassword, getAllUser } = require('../controller/auth.controllers');

router.post('/login', login);
router.post('/register/user', registerUser);
router.post('/register/su', registerSU);
router.post('/register/admin', authenticateUser, registerAdmin);
router.post('/forgotPassword', forgotPassword);
router.post('/change-password', changePassword);
router.get('/getAlluser', authenticateUser,getAllUser);
module.exports = router;