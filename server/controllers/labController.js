const pool      = require('../config/db');
const logAccess = require('../utils/logger');

async function getLabReports(req, res) {
  const { patientId } = req.params;
  const ip     = req.ip;
  const device = req.headers['user-agent'];

  try {
    const [reports] = await pool.execute(
      `SELECT l.*, u.name AS technician_name
       FROM lab_reports l
       JOIN users u ON l.lab_tech_id = u.id
       WHERE l.patient_id = ?
       ORDER BY l.report_date DESC`,
      [patientId]
    );

    await logAccess({
      userId:   req.user.id,
      role:     req.user.role,
      action:   'VIEW_LAB',
      resource: `/api/lab/${patientId}`,
      ip,
      device,
      outcome:  'success'
    });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function createLabReport(req, res) {
  const { patient_id, test_name, result } = req.body;
  const ip     = req.ip;
  const device = req.headers['user-agent'];

  if (!patient_id || !test_name || !result) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await pool.execute(
      `INSERT INTO lab_reports (patient_id, lab_tech_id, test_name, result, status)
       VALUES (?, ?, ?, ?, 'completed')`,
      [patient_id, req.user.id, test_name, result]
    );

    await logAccess({
      userId:   req.user.id,
      role:     req.user.role,
      action:   'CREATE_LAB',
      resource: '/api/lab',
      ip,
      device,
      outcome:  'success'
    });

    res.status(201).json({ message: 'Lab report added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getLabReports, createLabReport };