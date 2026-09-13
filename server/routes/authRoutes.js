const express      = require('express');
const router       = express.Router();
const { register, login, faceLogin, enrollFace, getEnrolledFaces, getPublicRoles } = require('../controllers/authController');
const verifyToken  = require('../middleware/authMiddleware');
const allowRoles   = require('../middleware/rbacMiddleware');

router.post('/login',          login);
router.post('/face-login',     faceLogin);
router.get('/enrolled-faces',  getEnrolledFaces);
router.post('/enroll-face',    enrollFace);
router.get('/roles',           getPublicRoles);
router.post('/register',       register);

module.exports = router;