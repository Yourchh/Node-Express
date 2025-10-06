const JWTUtils = require('../utils/jwt');
const User = require('../models/User');
//Middlreware para autenticar usuarios mediante JWT
const authenticate = async (req, res, next) => {
    try {
        const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = JWTUtils.verifyToken(token);
        const user = await User.findById(decoded.userId);

        if (!user || !user.is_active) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { authenticate };