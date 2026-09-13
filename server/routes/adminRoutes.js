const express     = require('express');
const router      = express.Router();
const {
  getAllUsers,
  getAccessLogs,
  getAlerts,
  deactivateUser,
  createPatient,
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  updateUserRole,
  toggleUserStatus,
  resetUserFaceId,
  getSecuritySettings,
  updateSecuritySetting,
  getLoginActivity
} = require('../controllers/adminController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles  = require('../middleware/rbacMiddleware');

// User & Access Auditing
router.get('/users',                      verifyToken, allowRoles('admin','it_security'), getAllUsers);
router.get('/logs',                       verifyToken, allowRoles('admin','it_security'), getAccessLogs);
router.get('/alerts',                     verifyToken, allowRoles('admin','it_security'), getAlerts);
router.get('/login-activity',             verifyToken, allowRoles('admin','it_security'), getLoginActivity);
router.put('/users/:userId/deactivate',   verifyToken, allowRoles('admin'), deactivateUser);
router.post('/patients',                  verifyToken, allowRoles('admin'), createPatient);

// Dynamic Role Management
router.get('/roles',                      verifyToken, allowRoles('admin','it_security'), getAllRoles);
router.post('/roles',                     verifyToken, allowRoles('admin'), createRole);
router.put('/roles/:roleId',              verifyToken, allowRoles('admin'), updateRole);
router.delete('/roles/:roleId',           verifyToken, allowRoles('admin'), deleteRole);

// Staff Account & Login Controls
router.put('/users/:userId/role',         verifyToken, allowRoles('admin'), updateUserRole);
router.put('/users/:userId/toggle-status',verifyToken, allowRoles('admin','it_security'), toggleUserStatus);
router.post('/users/:userId/reset-face',  verifyToken, allowRoles('admin','it_security'), resetUserFaceId);

// Global Security Policies
router.get('/security-settings',          verifyToken, allowRoles('admin','it_security'), getSecuritySettings);
router.put('/security-settings',          verifyToken, allowRoles('admin'), updateSecuritySetting);

module.exports = router;