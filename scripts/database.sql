-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many: Users to Roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- Many-to-many: Roles to Permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
('admin', 'System administrator with full access'),
('manager', 'Manager with elevated privileges'),
('user', 'Regular user with basic access')
ON CONFLICT (name) DO NOTHING;

-- Insert sample permissions
INSERT INTO permissions (name, description, resource, action) VALUES 
('users:read', 'Read user data', 'users', 'READ'),
('users:write', 'Create/update users', 'users', 'WRITE'),
('users:delete', 'Delete users', 'users', 'DELETE'),
('roles:read', 'Read roles', 'roles', 'READ'),
('roles:write', 'Create/update roles', 'roles', 'WRITE'),
('roles:delete', 'Delete roles', 'roles', 'DELETE'),
('products:read', 'Read products', 'products', 'READ'),
('products:write', 'Create/update products', 'products', 'WRITE'),
('products:delete', 'Delete products', 'products', 'DELETE')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), -- admin has all permissions
(2, 1), (2, 4), (2, 7), (2, 8), -- manager has read/write for products and read for users/roles
(3, 1), (3, 7) -- user has read only for users and products
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create admin user (password: admin123)
INSERT INTO users (username, email, password_hash) VALUES 
('admin', 'admin@system.com', '$2a$12$LQv3c1yqBWVHxkd0L6kZrOa7TUY2gZBYZoj3q5A9m6nS8JN9qY1W.') -- bcrypt hash for 'admin123'
ON CONFLICT (email) DO NOTHING;

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 1)
ON CONFLICT (user_id, role_id) DO NOTHING;