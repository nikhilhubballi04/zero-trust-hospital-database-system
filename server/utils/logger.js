const pool = require('../config/db');

async function logAccess({ userId, role, action, resource, ip, device, outcome }) {
  try {
    await pool.execute(
      `INSERT INTO access_logs
         (user_id, role, action, resource, ip_address, device_info, outcome)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId || null, role || null, action, resource || null, ip, device || null, outcome]
    );
  } catch (err) {
    console.error('Logger error:', err.message);
  }
}

module.exports = logAccess;