const express = require('express');
const UserController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { hasPermission, hasRole } = require('../middleware/permissions');

const router = express.Router();

router.use(authenticate);

router.get('/', hasPermission('users:read'), UserController.getAllUsers);
router.get('/:id', hasPermission('users:read'), UserController.getUserById);
router.put('/:id', hasPermission('users:write'), UserController.updateUser);
router.delete('/:id', hasPermission('users:delete'), UserController.deleteUser);
router.post('/:id/change-password', hasPermission('users:write'), UserController.changePassword);

router.post('/assign-role', hasRole('admin'), UserController.assignRoleToUser);
router.post('/remove-role', hasRole('admin'), UserController.removeRoleFromUser);

router.get('/:userId/roles', hasPermission('users:read'), UserController.getUserRoles);
router.get('/:userId/permissions', hasPermission('users:read'), UserController.getUserPermissions);


module.exports = router;