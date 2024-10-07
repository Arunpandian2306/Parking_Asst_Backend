const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const sendError = (res, message, details = null, statusCode = 401) => {
    return res.status(statusCode).json({ error: message, details });
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return sendError(res, 'Token is required', null, 401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err);
            if (err.name === 'TokenExpiredError') {
                return sendError(res, 'Token has expired', null, 401);
            }
            return sendError(res, 'Invalid token', null, 403);
        }
        req.user = user;
        next();
    });
};

module.exports = verifyToken;
