const express = require('express');
const UserController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { hasPermission, hasRole } = require('../middleware/permissions');

const router = express.Router();

router.get('/', 
  authenticate, 
  hasPermission('users:read'), 
  UserController.getAllUsers
);

router.post('/assign-role', 
  authenticate, 
  hasRole('admin'), 
  UserController.assignRoleToUser
);

router.get('/:userId/roles', 
  authenticate, 
  hasPermission('users:read'), 
  UserController.getUserRoles
);

module.exports = router;