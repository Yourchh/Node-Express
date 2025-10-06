const db = require('../config/database');

class Role {
    //Obtener todos los roles
    static async findAll() {
        const result = await db.query(
            'SELECT * FROM roles ORDER BY name'
        );
        return result.rows;
    }
    //Obtener un rol por su ID
    static async findById(id) {
        const result = await db.query(
            'SELECT * FROM roles WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }
    //Obtener un rol por su nombre
    static async findByName(name) {
        const result = await db.query(
            'SELECT * FROM roles WHERE name = $1',
            [name]
        );
        return result.rows[0];
    }
    //Crear un nuevo rol
    static async create(roleData) {
        const { name, description } = roleData;

        const result = await db.query(
            `INSERT INTO roles (name, description) 
       VALUES ($1, $2) 
       RETURNING *`,
            [name, description]
        );

        return result.rows[0];
    }
    //Actualizar un rol existente
    static async update(id, roleData) {
        const { name, description } = roleData;

        const result = await db.query(
            `UPDATE roles 
       SET name = $1, description = $2 
       WHERE id = $3 
       RETURNING *`,
            [name, description, id]
        );

        return result.rows[0];
    }
    //Eliminar un rol
    static async delete(id) {
        const result = await db.query(
            'DELETE FROM roles WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }
    //Obtener todos los usuarios con un rol específico
    static async getUsersWithRole(roleId) {
        const result = await db.query(
            `SELECT u.id, u.username, u.email, u.is_active 
       FROM users u 
       INNER JOIN user_roles ur ON u.id = ur.user_id 
       WHERE ur.role_id = $1`,
            [roleId]
        );
        return result.rows;
    }
    //Obtener todos los permisos asociados a un rol específico
    static async getRolePermissions(roleId) {
        const result = await db.query(
            `SELECT p.* FROM permissions p 
       INNER JOIN role_permissions rp ON p.id = rp.permission_id 
       WHERE rp.role_id = $1`,
            [roleId]
        );
        return result.rows;
    }
}

module.exports = Role;