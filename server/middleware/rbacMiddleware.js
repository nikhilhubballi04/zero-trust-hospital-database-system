function allowRoles(...roles) {
  return function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Your role (${req.user.role}) cannot access this resource.`
      });
    }
    next();
  };
}

module.exports = allowRoles;