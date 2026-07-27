const pool = require('../config/db');

const syncUser = async(req, res, next) => {
    try{
        res.status(200).json({
            message: 'Not Impelemented Yet',
        });
    } 
    catch(err){
        next(err);
    }
};

module.exports = {syncUser};