const express     = require('express');
const router      = express.Router();
const {
  bookAppointment,
  getAllAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles  = require('../middleware/rbacMiddleware');

router.post('/',            bookAppointment);
router.get('/',             verifyToken, allowRoles('admin','doctor','nurse'), getAllAppointments);
router.put('/:id/status',   verifyToken, allowRoles('admin'), updateAppointmentStatus);

module.exports = router;