const jwt = require('jsonwebtoken');

class JWTUtils {
    //Generar tokens JWT
    static generateToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });
    }
    //Verificar tokens JWT
    static verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
    //Extraer token del encabezado de autorización
    static extractTokenFromHeader(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }
}

module.exports = JWTUtils;