const pool = require('../config/db');

async function getAllUsers(req, res) {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, is_active, created_at, last_login FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getAccessLogs(req, res) {
  try {
    const [logs] = await pool.execute(
      `SELECT a.*, u.name AS user_name
       FROM access_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC
       LIMIT 200`
    );
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getAlerts(req, res) {
  try {
    const [alerts] = await pool.execute(
      `SELECT a.*, u.name AS user_name
       FROM access_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.outcome IN ('denied','failed')
       ORDER BY a.created_at DESC
       LIMIT 100`
    );
    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deactivateUser(req, res) {
  const { userId } = req.params;
  try {
    await pool.execute(
      'UPDATE users SET is_active = false WHERE id = ?', [userId]
    );
    res.json({ message: 'User deactivated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function createPatient(req, res) {
  const { name, dob, gender, blood_type, phone, address } = req.body;

  if (!name || !dob) {
    return res.status(400).json({ message: 'Name and date of birth are required' });
  }

  try {
    await pool.execute(
      `INSERT INTO patients (name, dob, gender, blood_type, phone, address, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, dob, gender||null, blood_type||null, phone||null, address||null, req.user.id]
    );
    res.status(201).json({ message: 'Patient added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getAllUsers, getAccessLogs, getAlerts, deactivateUser, createPatient };