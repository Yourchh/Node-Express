const db = require('../config/database');
const User = require('../models/User');
const Role = require('../models/Role');

class UserController {
    //Obtener todos los usuarios
    static async getAllUsers(req, res) {
        try {
            const users = await User.findAll();
            res.json({ users });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    //Obtener usuario por ID
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            const roles = await User.getUserRoles(id);
            const permissions = await User.getUserPermissions(id);

            res.json({
                user: {
                    ...user,
                    roles,
                    permissions
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    //Asignar rol a un usuario
    static async assignRoleToUser(req, res) {
        try {
            const { userId, roleId } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            const role = await Role.findById(roleId);
            if (!role) {
                return res.status(404).json({ error: 'Rol no encontrado' });
            }

            await User.assignRole(userId, roleId);

            res.json({ message: 'Rol asignado al usuario exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    //Remover rol de un usuario
    static async removeRoleFromUser(req, res) {
        try {
            const { userId, roleId } = req.body;

            await User.removeRole(userId, roleId);

            res.json({ message: 'Rol removido del usuario exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    //Actualizar usuario
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { username, email, is_active } = req.body;

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            const updatedUser = await User.update(id, { username, email, is_active });

            res.json({
                message: 'Usuario actualizado exitosamente',
                user: updatedUser
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Obtener roles de un usuario
    static async getUserRoles(req, res) {
        try {
            const { userId } = req.params;
            const roles = await User.getUserRoles(userId);

            res.json({ roles });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Obtener permisos de un usuario
    static async getUserPermissions(req, res) {
        try {
            const { userId } = req.params;
            const permissions = await User.getUserPermissions(userId);

            res.json({ permissions });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = UserController;