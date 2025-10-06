const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    //Crear usuario
    static async create(userData) {
        const { username, email, password } = userData;
        const passwordHash = await bcrypt.hash(password, 12);

        const result = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
            [username, email, passwordHash]
        );
        return result.rows[0];
    }
    //Buscar usuario por correo electronico
    static async findByEmail(email) {
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }
    //Buscar usuario por id
    static async findById(id) {
        const result = await db.query(
            'SELECT id, username, email, is_active, created_at FROM users WHERE id= $1',
            [id]
        );
        return result.rows[0];
    }
    //Asignar un rol a un usuario
    static async assignRole(userId, roleId) {
        await db.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, roleId]
        );
    }
    //Obtener los roles de un usuario
    static async getUserRoles(userId) {
        const result = await db.query(
            `SELECT r.id, r.name, r.description 
       FROM roles r 
       INNER JOIN user_roles ur ON r.id = ur.role_id 
       WHERE ur.user_id = $1`,
            [userId]
        );
        return result.rows;
    }
    //Obtener los permisos de un usuario
    static async getUserPermissions(userId) {
        const result = await db.query(
            `SELECT DISTINCT p.name, p.resource, p.action 
       FROM permissions p 
       INNER JOIN role_permissions rp ON p.id = rp.permission_id 
       INNER JOIN user_roles ur ON rp.role_id = ur.role_id 
       WHERE ur.user_id = $1`,
            [userId]
        );
        return result.rows;
    }
    //Verificar la contraseña
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    // Actualizar usuario    
    static async update(userId, userData) {
        const { username, email, is_active } = userData;

        const result = await db.query(
            `UPDATE users 
       SET username = $1, email = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING id, username, email, is_active, created_at, updated_at`,
            [username, email, is_active, userId]
        );

        return result.rows[0];
    }
    //Eliminar usuario
    static async delete(userId) {
        const result = await db.query(
            'DELETE FROM users WHERE id = $1 RETURNING id, username, email',
            [userId]
        );
        return result.rows[0];
    }
    //Eliminar rol de un usuario
    static async removeRole(userId, roleId) {
        await db.query(
            'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2',
            [userId, roleId]
        );
    }
    //Listar todos los usuarios
    static async findAll() {
        const result = await db.query(
            'SELECT id, username, email, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
        );
        return result.rows;
    }
    //Cambiar la contraseña de un usuario
    static async changePassword(userId, newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, 12);

        await db.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [passwordHash, userId]
        );
    }
}

module.exports = User;