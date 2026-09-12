const pool = require('../config/db');

async function deviceCheck(req, res, next) {
  const ip     = req.ip;
  const device = req.headers['user-agent'];

  if (!req.user) return next();

  try {
    const [rows] = await pool.execute(
      `SELECT * FROM trusted_devices WHERE user_id = ? AND ip_address = ?`,
      [req.user.id, ip]
    );

    if (rows.length === 0) {
      await pool.execute(
        `INSERT INTO trusted_devices (user_id, ip_address, device_info) VALUES (?, ?, ?)`,
        [req.user.id, ip, device]
      );
    }

    req.deviceTrusted = true;
    next();
  } catch (err) {
    console.error('Device check error:', err.message);
    next();
  }
}

module.exports = deviceCheck;