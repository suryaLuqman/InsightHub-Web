const router = require('express').Router();
const { login, registerUser, registerAdmin,authenticateUser,registerSU , changePassword,forgotPassword } = require('../controller/auth.controllers');

router.post('/login', login);
router.get('/login', (req, res) => {
    res.render('login');
});
router.post('/register-user', registerUser);
router.get ('/register-user',(req,res) => {
    res.render('register-user');
});

router.post('/register/su', registerSU);
router.post('/register/admin', authenticateUser, registerAdmin);
router.post('/forgot-Password', forgotPassword);
router.get ('/forgot-password',(req,res) => {
    res.render('forgot-password');
});
router.post('/change-password', changePassword);
router.get ('/change-password',(req,res) => {
    res.render('change-password');
});
module.exports = router;