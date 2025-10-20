// src/routes/permissions.js
const express = require('express');
const PermissionController = require('../controllers/permissionController');
const { authenticate } = require('../middleware/auth');
const { hasRole } = require('../middleware/permissions');

const router = express.Router();

// Proteger todas las rutas de permisos. Solo un admin puede gestionarlas.
router.use(authenticate, hasRole('admin'));

// Rutas CRUD para Permisos
router.get('/', PermissionController.getAllPermissions);
router.post('/', PermissionController.createPermission);
router.get('/:id', PermissionController.getPermissionById);
router.put('/:id', PermissionController.updatePermission);
router.delete('/:id', PermissionController.deletePermission);

module.exports = router;