const pool = require('../config/db');
const logAccess = require('../utils/logger');

async function getAllUsers(req, res) {
  try {
    const [users] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.role, u.is_active, u.face_enrolled,
             (u.face_descriptor IS NOT NULL) as has_descriptor,
             u.face_last_verified, u.must_re_enroll_face, u.created_at, u.last_login,
             r.display_name as role_display, r.color as role_color, r.clearance_level
      FROM users u
      LEFT JOIN roles r ON u.role = r.name
      ORDER BY u.created_at DESC
    `);
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

// ==================== ROLE MANAGEMENT ====================

async function getAllRoles(req, res) {
  try {
    const [roles] = await pool.execute(`
      SELECT r.*, COUNT(u.id) as user_count
      FROM roles r
      LEFT JOIN users u ON r.name = u.role
      GROUP BY r.id
      ORDER BY r.is_system DESC, r.id ASC
    `);
    res.json(roles);
  } catch (err) {
    console.error('getAllRoles error:', err);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
}

async function createRole(req, res) {
  const {
    name,
    display_name,
    description,
    clearance_level,
    color,
    can_access_ehr,
    can_access_lab,
    can_access_pharmacy,
    can_access_appointments,
    can_access_admin,
    can_access_security
  } = req.body;

  if (!name || !display_name) {
    return res.status(400).json({ message: 'Role system key and display name are required' });
  }

  const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

  try {
    const [existing] = await pool.execute('SELECT id FROM roles WHERE name = ?', [cleanName]);
    if (existing.length > 0) {
      return res.status(409).json({ message: `Role key '${cleanName}' already exists` });
    }

    await pool.execute(`
      INSERT INTO roles (
        name, display_name, description, clearance_level, color,
        can_access_ehr, can_access_lab, can_access_pharmacy, can_access_appointments, can_access_admin, can_access_security, is_system
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)
    `, [
      cleanName,
      display_name,
      description || '',
      clearance_level || 'Level 2 · General Staff',
      color || '#3B82F6',
      Boolean(can_access_ehr),
      Boolean(can_access_lab),
      Boolean(can_access_pharmacy),
      Boolean(can_access_appointments),
      Boolean(can_access_admin),
      Boolean(can_access_security)
    ]);

    await logAccess({
      userId: req.user?.id,
      role: req.user?.role,
      action: 'ROLE_CREATED',
      resource: `/api/admin/roles/${cleanName}`,
      ip: req.ip,
      device: req.headers['user-agent'],
      outcome: 'success'
    });

    res.status(201).json({
      success: true,
      message: `Role '${display_name}' created successfully!`,
      roleName: cleanName
    });
  } catch (err) {
    console.error('createRole error:', err);
    res.status(500).json({ message: 'Failed to create role' });
  }
}

async function updateRole(req, res) {
  const { roleId } = req.params;
  const {
    display_name,
    description,
    clearance_level,
    color,
    can_access_ehr,
    can_access_lab,
    can_access_pharmacy,
    can_access_appointments,
    can_access_admin,
    can_access_security
  } = req.body;

  try {
    await pool.execute(`
      UPDATE roles SET
        display_name = COALESCE(?, display_name),
        description = COALESCE(?, description),
        clearance_level = COALESCE(?, clearance_level),
        color = COALESCE(?, color),
        can_access_ehr = COALESCE(?, can_access_ehr),
        can_access_lab = COALESCE(?, can_access_lab),
        can_access_pharmacy = COALESCE(?, can_access_pharmacy),
        can_access_appointments = COALESCE(?, can_access_appointments),
        can_access_admin = COALESCE(?, can_access_admin),
        can_access_security = COALESCE(?, can_access_security)
      WHERE id = ?
    `, [
      display_name, description, clearance_level, color,
      can_access_ehr, can_access_lab, can_access_pharmacy, can_access_appointments, can_access_admin, can_access_security,
      roleId
    ]);

    res.json({ success: true, message: 'Role updated successfully' });
  } catch (err) {
    console.error('updateRole error:', err);
    res.status(500).json({ message: 'Failed to update role' });
  }
}

async function deleteRole(req, res) {
  const { roleId } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM roles WHERE id = ?', [roleId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Role not found' });
    if (rows[0].is_system) {
      return res.status(400).json({ message: 'System default roles cannot be deleted' });
    }
    const [users] = await pool.execute('SELECT id FROM users WHERE role = ?', [rows[0].name]);
    if (users.length > 0) {
      return res.status(400).json({
        message: `Cannot delete role: ${users.length} staff member(s) currently assigned. Reassign them first.`
      });
    }
    await pool.execute('DELETE FROM roles WHERE id = ?', [roleId]);
    res.json({ success: true, message: `Role '${rows[0].display_name}' deleted` });
  } catch (err) {
    console.error('deleteRole error:', err);
    res.status(500).json({ message: 'Failed to delete role' });
  }
}

// ==================== STAFF LOGIN & ACCOUNT CONTROL ====================

async function updateUserRole(req, res) {
  const { userId } = req.params;
  const { role } = req.body;
  if (!role) return res.status(400).json({ message: 'Role is required' });
  try {
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    await logAccess({
      userId: req.user?.id,
      role: req.user?.role,
      action: 'STAFF_ROLE_REASSIGNED',
      resource: `/api/admin/users/${userId}/role`,
      ip: req.ip,
      device: req.headers['user-agent'],
      outcome: 'success'
    });
    res.json({ success: true, message: 'User role updated successfully' });
  } catch (err) {
    console.error('updateUserRole error:', err);
    res.status(500).json({ message: 'Failed to update user role' });
  }
}

async function toggleUserStatus(req, res) {
  const { userId } = req.params;
  try {
    const [rows] = await pool.execute('SELECT id, is_active, name FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const newStatus = !rows[0].is_active;
    await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, userId]);
    await logAccess({
      userId: req.user?.id,
      role: req.user?.role,
      action: newStatus ? 'STAFF_ACCOUNT_UNLOCKED' : 'STAFF_ACCOUNT_LOCKED',
      resource: `/api/admin/users/${userId}/status`,
      ip: req.ip,
      device: req.headers['user-agent'],
      outcome: 'success'
    });
    res.json({
      success: true,
      is_active: newStatus,
      message: `Account for ${rows[0].name} is now ${newStatus ? 'ACTIVE' : 'LOCKED'}`
    });
  } catch (err) {
    console.error('toggleUserStatus error:', err);
    res.status(500).json({ message: 'Failed to toggle account status' });
  }
}

async function resetUserFaceId(req, res) {
  const { userId } = req.params;
  try {
    const [rows] = await pool.execute('SELECT id, name FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    await pool.execute('UPDATE users SET face_enrolled = FALSE, face_descriptor = NULL, must_re_enroll_face = TRUE WHERE id = ?', [userId]);
    await logAccess({
      userId: req.user?.id,
      role: req.user?.role,
      action: 'STAFF_FACE_ID_REVOKED',
      resource: `/api/admin/users/${userId}/reset-face`,
      ip: req.ip,
      device: req.headers['user-agent'],
      outcome: 'success'
    });
    res.json({
      success: true,
      message: `Face ID revoked for ${rows[0].name}. Staff member must re-enroll face before next login.`
    });
  } catch (err) {
    console.error('resetUserFaceId error:', err);
    res.status(500).json({ message: 'Failed to revoke Face ID' });
  }
}

async function getSecuritySettings(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM system_settings');
    const settings = {};
    rows.forEach(r => settings[r.setting_key] = r.setting_value);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
}

async function updateSecuritySetting(req, res) {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ message: 'Setting key is required' });
  try {
    await pool.execute(
      'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      [key, String(value), String(value)]
    );
    await logAccess({
      userId: req.user?.id,
      role: req.user?.role,
      action: `POLICY_UPDATED_${key.toUpperCase()}`,
      resource: '/api/admin/security-settings',
      ip: req.ip,
      device: req.headers['user-agent'],
      outcome: 'success'
    });
    res.json({ success: true, message: `Policy ${key} updated to ${value}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update security setting' });
  }
}

async function getLoginActivity(req, res) {
  try {
    const [logs] = await pool.execute(`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM access_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.action IN ('LOGIN', 'BIOMETRIC_FACE_AUTH', 'BIOMETRIC_FACE_ENROLL', 'STAFF_REGISTERED', 'LOGIN_LOCKED_ATTEMPT', 'LOGIN_LOCKDOWN_BLOCKED', 'STAFF_ACCOUNT_LOCKED', 'STAFF_FACE_ID_REVOKED')
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch login activity' });
  }
}

module.exports = {
  getAllUsers,
  getAccessLogs,
  getAlerts,
  deactivateUser,
  createPatient,
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  updateUserRole,
  toggleUserStatus,
  resetUserFaceId,
  getSecuritySettings,
  updateSecuritySetting,
  getLoginActivity
};