const express     = require('express');
const router      = express.Router();
const {
  getAllUsers,
  getAccessLogs,
  getAlerts,
  deactivateUser,
  createPatient,
} = require('../controllers/adminController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles  = require('../middleware/rbacMiddleware');

router.get('/users',                   verifyToken, allowRoles('admin','it_security'), getAllUsers);
router.get('/logs',                    verifyToken, allowRoles('admin','it_security'), getAccessLogs);
router.get('/alerts',                  verifyToken, allowRoles('admin','it_security'), getAlerts);
router.put('/users/:userId/deactivate',verifyToken, allowRoles('admin'), deactivateUser);
router.post('/patients',               verifyToken, allowRoles('admin'), createPatient);

module.exports = router;