const pool = require('../config/db');

async function bookAppointment(req, res) {
  const { name, phone, email, dept, date, time, message } = req.body;

  if (!name || !phone || !dept || !date || !time) {
    return res.status(400).json({ message: 'Name, phone, department, date and time are required' });
  }

  try {
    await pool.execute(
      `INSERT INTO appointments
         (patient_name, phone, email, department, preferred_date, preferred_time, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, phone, email||null, dept, date, time, message||null]
    );
    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getAllAppointments(req, res) {
  try {
    const [appointments] = await pool.execute(
      `SELECT * FROM appointments ORDER BY preferred_date ASC, preferred_time ASC`
    );
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateAppointmentStatus(req, res) {
  const { id }     = req.params;
  const { status } = req.body;

  if (!['pending','confirmed','cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    await pool.execute(
      'UPDATE appointments SET status = ? WHERE id = ?', [status, id]
    );
    res.json({ message: 'Appointment status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { bookAppointment, getAllAppointments, updateAppointmentStatus };