const express      = require('express');
const router       = express.Router();
const { register, login } = require('../controllers/authController');
const verifyToken  = require('../middleware/authMiddleware');
const allowRoles   = require('../middleware/rbacMiddleware');

router.post('/login',    login);
router.post('/register', verifyToken, allowRoles('admin'), register);

module.exports = router;