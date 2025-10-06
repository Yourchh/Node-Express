const User = require('../models/User');
const JWTUtils = require('../utils/jwt');

class AuthController {
    //Registrar nuevo usuario
    static async register(req, res) {
        try {
            const { username, email, password } = req.body;

            // Verificar si el usuario ya existe
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const user = await User.create({ username, email, password });

            // Asignar rol por defecto (ID 3)
            await User.assignRole(user.id, 3);

            res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    //Iniciar sesión
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findByEmail(email);
            if (!user || !user.is_active) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isValidPassword = await User.verifyPassword(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const roles = await User.getUserRoles(user.id);
            const permissions = await User.getUserPermissions(user.id);

            const token = JWTUtils.generateToken({
                userId: user.id,
                email: user.email,
                roles: roles.map(role => role.name)
            });

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles,
                    permissions
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    //Obtener perfil del usuario autenticado
    static async getProfile(req, res) {
        try {
            const roles = await User.getUserRoles(req.user.id);
            const permissions = await User.getUserPermissions(req.user.id);

            res.json({
                user: {
                    ...req.user,
                    roles,
                    permissions
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AuthController;