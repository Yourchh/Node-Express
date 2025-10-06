const Role = require('../models/Role');
const Permission = require('../models/Permission');

class RoleController {
    // Obtener todos los roles
    static async getAllRoles(req, res) {
        try {
            const roles = await Role.findAll();
            res.json({ roles });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Obtener un rol por ID, incluyendo permisos y usuarios asociados
    static async getRoleById(req, res) {
        try {
            const { id } = req.params;
            const role = await Role.findById(id);

            if (!role) {
                return res.status(404).json({ error: 'Rol no encontrado' });
            }

            const permissions = await Role.getRolePermissions(id);
            const users = await Role.getUsersWithRole(id);

            res.json({
                role: {
                    ...role,
                    permissions,
                    users
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Crear un nuevo rol    
    static async createRole(req, res) {
        try {
            const { name, description } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'El nombre del rol es requerido' });
            }

            const existingRole = await Role.findByName(name);
            if (existingRole) {
                return res.status(400).json({ error: 'Ya existe un rol con ese nombre' });
            }

            const role = await Role.create({ name, description });

            res.status(201).json({
                message: 'Rol creado exitosamente',
                role
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Actualizar un rol existente
    static async updateRole(req, res) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            const role = await Role.findById(id);
            if (!role) {
                return res.status(404).json({ error: 'Rol no encontrado' });
            }

            const updatedRole = await Role.update(id, { name, description });

            res.json({
                message: 'Rol actualizado exitosamente',
                role: updatedRole
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Eliminar un rol
    static async assignPermissionToRole(req, res) {
        try {
            const { roleId, permissionId } = req.body;

            const role = await Role.findById(roleId);
            if (!role) {
                return res.status(404).json({ error: 'Rol no encontrado' });
            }

            const permission = await Permission.findById(permissionId);
            if (!permission) {
                return res.status(404).json({ error: 'Permiso no encontrado' });
            }

            await Permission.assignToRole(roleId, permissionId);

            res.json({ message: 'Permiso asignado al rol exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Remover un permiso de un rol
    static async removePermissionFromRole(req, res) {
        try {
            const { roleId, permissionId } = req.body;

            await Permission.removeFromRole(roleId, permissionId);

            res.json({ message: 'Permiso removido del rol exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = RoleController;