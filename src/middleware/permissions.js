const User = require('../models/User');
// Middleware para verificar permisos de usuario
const hasPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const permissions = await User.getUserPermissions(req.user.id);
      const hasPerm = permissions.some(perm => perm.name === permissionName);
      
      if (!hasPerm) {
        return res.status(403).json({ 
          error: 'Insufficient permissions to access this resource' 
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Error checking permissions' });
    }
  };
};
// Middleware para verificar roles de usuario
const hasRole = (roleName) => {
  return async (req, res, next) => {
    try {
      const roles = await User.getUserRoles(req.user.id);
      const hasRole = roles.some(role => role.name === roleName);
      
      if (!hasRole) {
        return res.status(403).json({ 
          error: 'Insufficient role privileges' 
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Error checking roles' });
    }
  };
};

module.exports = { hasPermission, hasRole };