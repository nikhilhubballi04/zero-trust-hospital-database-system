const pool = require('../config/db');

// Cache roles with 15s TTL for high performance
let rolesCache = null;
let lastCacheTime = 0;

async function getCachedRoles() {
  const now = Date.now();
  if (rolesCache && now - lastCacheTime < 15000) return rolesCache;
  try {
    const [rows] = await pool.execute('SELECT * FROM roles');
    rolesCache = rows;
    lastCacheTime = now;
    return rows;
  } catch (e) {
    return [];
  }
}

function allowRoles(...roles) {
  return async function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userRole = req.user.role;

    // Administrators always have full clearance
    if (userRole === 'admin') {
      return next();
    }

    // Direct role match
    if (roles.includes(userRole)) {
      return next();
    }

    // Dynamic permission capabilities check from roles table
    try {
      const allRoles = await getCachedRoles();
      const roleConfig = allRoles.find(r => r.name === userRole);

      if (roleConfig) {
        for (const r of roles) {
          if (roleConfig[r] === 1 || roleConfig[r] === true) return next();
          if ((r === 'doctor' || r === 'nurse') && roleConfig.can_access_ehr) return next();
          if (r === 'lab_tech' && roleConfig.can_access_lab) return next();
          if (r === 'pharmacist' && roleConfig.can_access_pharmacy) return next();
          if (r === 'it_security' && roleConfig.can_access_security) return next();
        }
      }
    } catch (e) {
      console.warn('RBAC dynamic check error:', e);
    }

    return res.status(403).json({
      message: `Access denied. Your role (${userRole}) cannot access this resource.`
    });
  };
}

module.exports = allowRoles;