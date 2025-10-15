const express = require('express');
const RoleController = require('../controllers/roleController');
const { authenticate } = require('../middleware/auth');
const { hasPermission, hasRole } = require('../middleware/permissions');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', hasPermission('roles:read'), RoleController.getAllRoles);
router.get('/:id', hasPermission('roles:read'), RoleController.getRoleById);
router.post('/', hasRole('admin'), RoleController.createRole);
router.put('/:id', hasRole('admin'), RoleController.updateRole);
router.delete('/:id', hasRole('admin'), RoleController.deleteRole); // Nueva ruta

router.post('/assign-permission', hasRole('admin'), RoleController.assignPermissionToRole);
router.post('/remove-permission', hasRole('admin'), RoleController.removePermissionFromRole);

module.exports = router;