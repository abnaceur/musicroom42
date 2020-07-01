var express = require('express');
const router = express.Router();
const multer = require('../middleware/FileUpload');
const userController = require('../controllers/userController');
//=> End of declared dependencies
// @desc    Signup new user
// @route   POST /api/v1/users/signup
// @access  Public
// router.post('/signup', multer.upload.any(), userController.createNewAccount)
// @desc    Signup new user
// @route   POST /api/v1/users/signup
// @access  Public
router.post('/signup', userController.createNewAccount);
// @desc    Signin  user
// @route   POST /api/v1/users/signin
// @access  Public
router.post('/signin', userController.loginUser);
module.exports = router;