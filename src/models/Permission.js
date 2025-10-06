const db = require('../config/database');

class Permission {
    //Buscar, encontrar o listar todos as permisos
    static async findAll() {
        const result = await db.query(
            'SELECT * FROM permissions ORDER BY resource, action'
        );
        return result.rows;
    }
    //Buscar un permiso por su ID
    static async findById(id) {
        const result = await db.query(
            'SELECT * FROM permissions WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }
    //Buscar un permiso por su nombre
    static async findByName(name) {
        const result = await db.query(
            'SELECT * FROM permissions WHERE name = $1',
            [name]
        );
        return result.rows[0];
    }
    //Buscar permisos por recurso
    static async findByResource(resource) {
        const result = await db.query(
            'SELECT * FROM permissions WHERE resource = $1 ORDER BY action',
            [resource]
        );
        return result.rows;
    }
    //Crear un nuevo permiso
    static async create(permissionData) {
        const { name, description, resource, action } = permissionData;

        const result = await db.query(
            `INSERT INTO permissions (name, description, resource, action) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
            [name, description, resource, action]
        );

        return result.rows[0];
    }
    //Actualizar un permiso existente
    static async update(id, permissionData) {
        const { name, description, resource, action } = permissionData;

        const result = await db.query(
            `UPDATE permissions 
       SET name = $1, description = $2, resource = $3, action = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING *`,
            [name, description, resource, action, id]
        );

        return result.rows[0];
    }
    //Eliminar un permiso
    static async delete(id) {
        const result = await db.query(
            'DELETE FROM permissions WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }
    //Asignar permisos a roles
    static async assignToRole(roleId, permissionId) {
        await db.query(
            `INSERT INTO role_permissions (role_id, permission_id) 
       VALUES ($1, $2) 
       ON CONFLICT (role_id, permission_id) DO NOTHING`,
            [roleId, permissionId]
        );
    }
    //Remover un permiso de un rol
    static async removeFromRole(roleId, permissionId) {
        await db.query(
            'DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
            [roleId, permissionId]
        );
    }
    //Obtener permisos asignados a un rol
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

module.exports = Permission;