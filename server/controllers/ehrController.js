const pool      = require('../config/db');
const logAccess = require('../utils/logger');

async function getPatientEHR(req, res) {
  const { patientId } = req.params;
  const ip     = req.ip;
  const device = req.headers['user-agent'];

  try {
    const [records] = await pool.execute(
      `SELECT e.*, u.name AS doctor_name
       FROM ehr_records e
       JOIN users u ON e.doctor_id = u.id
       WHERE e.patient_id = ?
       ORDER BY e.visit_date DESC`,
      [patientId]
    );

    await logAccess({
      userId:   req.user.id,
      role:     req.user.role,
      action:   'VIEW_EHR',
      resource: `/api/ehr/${patientId}`,
      ip,
      device,
      outcome:  'success'
    });

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function createEHR(req, res) {
  const { patient_id, diagnosis, prescription, notes } = req.body;
  const ip     = req.ip;
  const device = req.headers['user-agent'];

  if (!patient_id || !diagnosis) {
    return res.status(400).json({ message: 'Patient ID and diagnosis are required' });
  }

  try {
    await pool.execute(
      `INSERT INTO ehr_records (patient_id, doctor_id, diagnosis, prescription, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, req.user.id, diagnosis, prescription || null, notes || null]
    );

    await logAccess({
      userId:   req.user.id,
      role:     req.user.role,
      action:   'CREATE_EHR',
      resource: '/api/ehr',
      ip,
      device,
      outcome:  'success'
    });

    res.status(201).json({ message: 'EHR record created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getPatientEHR, createEHR };