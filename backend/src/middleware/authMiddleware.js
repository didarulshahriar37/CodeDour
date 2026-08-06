const { auth } = require('../config/firebase');

const verifyToken = async(req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({
            error: 'No token provided'
        });
    }

    const token = authHeader.split('Bearer ')[1];

    try{
        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken;
        next();
    } 
    catch(error) {
        return res.status(401).json({
            error: 'Invalid or expired token'
        });
    }
};

const optionalVerifyToken = async(req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return next();
    }

    const token = authHeader.split('Bearer ')[1];

    try{
        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken;
    } 
    catch(error) {

    }
    next();
};

const pool = require('../config/db');

const verifyAdmin = async (req, res, next) => {
    await verifyToken(req, res, async () => {
        try {
            const userRes = await pool.query(`SELECT role FROM users WHERE firebase_uid = $1`, [req.user.uid]);
            if (userRes.rows.length === 0 || userRes.rows[0].role !== 'admin') {
                return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
            }
            next();
        } catch (err) {
            next(err);
        }
    });
};

module.exports = { verifyToken, optionalVerifyToken, verifyAdmin };