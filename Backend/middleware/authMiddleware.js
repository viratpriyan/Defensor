const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const userSnapshot = await db.collection('users').doc(decoded.id).get();

            if (!userSnapshot.exists) {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }

            req.user = { id: userSnapshot.id, ...userSnapshot.data() };
            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
