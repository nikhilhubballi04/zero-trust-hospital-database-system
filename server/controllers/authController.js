const pool      = require('../config/db');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const logAccess = require('../utils/logger');
require('dotenv').config();

async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await pool.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, role]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  const ip     = req.ip;
  const device = req.headers['user-agent'];

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = true', [email]
    );

    if (rows.length === 0) {
      await logAccess({ action:'LOGIN', ip, device, outcome:'failed' });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      await logAccess({ userId:user.id, role:user.role, action:'LOGIN', ip, device, outcome:'failed' });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id:user.id, name:user.name, role:user.role, email:user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    await logAccess({
      userId:user.id, role:user.role,
      action:'LOGIN', resource:'/api/auth/login',
      ip, device, outcome:'success'
    });

    res.json({
      token,
      user: { id:user.id, name:user.name, role:user.role, email:user.email }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { register, login };