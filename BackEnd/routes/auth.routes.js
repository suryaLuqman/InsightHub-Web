const router = require('express').Router();
const { login,deleteProfilePicture, registerUser,updateProfile, getUserProfile, registerAdmin,authenticateUser,registerSU , changePassword,forgotPassword, getAllUser } = require('../controller/auth.controllers');
const { image } = require ('../libs/multer');

router.post('/login', login);
router.post('/register/user', registerUser);
router.post('/register/su', registerSU);
router.post('/register/admin', authenticateUser, registerAdmin);
router.post('/forgotPassword', forgotPassword);
router.post('/change-password', changePassword);
router.get('/getAlluser', authenticateUser,getAllUser);
router.get('/profile', authenticateUser,getUserProfile);
router.put('/profile/update',image.single('profile_picture'),authenticateUser, updateProfile);
router.delete('/profile-picture', authenticateUser, deleteProfilePicture);


module.exports = router;