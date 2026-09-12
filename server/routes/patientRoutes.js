const express     = require('express');
const router      = express.Router();
const { getAllPatients, createPatient } = require('../controllers/patientController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles  = require('../middleware/rbacMiddleware');

router.get('/',  verifyToken, allowRoles('doctor','nurse','admin','lab_tech','pharmacist'), getAllPatients);
router.post('/', verifyToken, allowRoles('admin'), createPatient);

module.exports = router;