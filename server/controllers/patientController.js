const pool      = require('../config/db');
const logAccess = require('../utils/logger');

async function getAllPatients(req, res) {
  const ip     = req.ip;
  const device = req.headers['user-agent'];

  try {
    const [patients] = await pool.execute(
      'SELECT id, name, dob, gender, blood_type, phone FROM patients ORDER BY name'
    );

    await logAccess({
      userId:req.user.id, role:req.user.role,
      action:'VIEW_PATIENTS', resource:'/api/patients',
      ip, device, outcome:'success'
    });

    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function createPatient(req, res) {
  const { name, dob, gender, blood_type, phone, address } = req.body;
  const ip     = req.ip;
  const device = req.headers['user-agent'];

  if (!name || !dob) {
    return res.status(400).json({ message: 'Name and date of birth are required' });
  }

  try {
    await pool.execute(
      `INSERT INTO patients (name, dob, gender, blood_type, phone, address, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, dob, gender||null, blood_type||null, phone||null, address||null, req.user.id]
    );

    await logAccess({
      userId:req.user.id, role:req.user.role,
      action:'CREATE_PATIENT', resource:'/api/patients',
      ip, device, outcome:'success'
    });

    res.status(201).json({ message: 'Patient added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getAllPatients, createPatient };