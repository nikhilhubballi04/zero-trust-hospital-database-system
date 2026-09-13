const express      = require('express');
const router       = express.Router();
const { register, login, faceLogin, enrollFace, getEnrolledFaces } = require('../controllers/authController');
const verifyToken  = require('../middleware/authMiddleware');
const allowRoles   = require('../middleware/rbacMiddleware');

router.post('/login',          login);
router.post('/face-login',     faceLogin);
router.get('/enrolled-faces',  getEnrolledFaces);
router.post('/enroll-face',    verifyToken, enrollFace);
router.post('/register',       verifyToken, allowRoles('admin'), register);

module.exports = router;