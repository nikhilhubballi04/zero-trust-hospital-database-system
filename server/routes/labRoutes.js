const express         = require('express');
const router          = express.Router();
const labController   = require('../controllers/labController');
const verifyToken     = require('../middleware/authMiddleware');
const allowRoles      = require('../middleware/rbacMiddleware');

router.get('/:patientId',
  verifyToken,
  allowRoles('doctor', 'nurse', 'lab_tech', 'admin'),
  labController.getLabReports
);

router.post('/',
  verifyToken,
  allowRoles('lab_tech'),
  labController.createLabReport
);

module.exports = router;