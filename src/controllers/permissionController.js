// src/controllers/permissionController.js
const Permission = require('../models/Permission');

class PermissionController {
    // Obtener todos los permisos
    static async getAllPermissions(req, res) {
        try {
            const permissions = await Permission.findAll();
            res.json({ permissions });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Obtener un permiso por ID
    static async getPermissionById(req, res) {
        try {
            const { id } = req.params;
            const permission = await Permission.findById(id);
            if (!permission) {
                return res.status(404).json({ error: 'Permiso no encontrado' });
            }
            res.json({ permission });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Crear un nuevo permiso
    static async createPermission(req, res) {
        try {
            const { name, description, resource, action } = req.body;
            if (!name || !description || !resource || !action) {
                return res.status(400).json({ error: 'Todos los campos son requeridos' });
            }
            const newPermission = await Permission.create({ name, description, resource, action });
            res.status(201).json({
                message: 'Permiso creado exitosamente',
                permission: newPermission
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Actualizar un permiso
    static async updatePermission(req, res) {
        try {
            const { id } = req.params;
            const { name, description, resource, action } = req.body;

            const updatedPermission = await Permission.update(id, { name, description, resource, action });
            if (!updatedPermission) {
                return res.status(404).json({ error: 'Permiso no encontrado' });
            }
            res.json({
                message: 'Permiso actualizado exitosamente',
                permission: updatedPermission
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Eliminar un permiso
    static async deletePermission(req, res) {
        try {
            const { id } = req.params;
            const deletedPermission = await Permission.delete(id);
            if (!deletedPermission) {
                return res.status(404).json({ error: 'Permiso no encontrado' });
            }
            res.json({ message: 'Permiso eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = PermissionController;