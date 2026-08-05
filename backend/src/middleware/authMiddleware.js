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

module.exports = {verifyToken, optionalVerifyToken};