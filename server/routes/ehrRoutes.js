const express         = require('express');
const router          = express.Router();
const ehrController   = require('../controllers/ehrController');
const verifyToken     = require('../middleware/authMiddleware');
const allowRoles      = require('../middleware/rbacMiddleware');

router.get('/:patientId',
  verifyToken,
  allowRoles('doctor', 'nurse', 'admin'),
  ehrController.getPatientEHR
);

router.post('/',
  verifyToken,
  allowRoles('doctor'),
  ehrController.createEHR
);

module.exports = router;