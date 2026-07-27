const pool = require('../config/db');

const syncUser = async(req, res, next) => {
    try{
        // const {} = req.user;
        // const name 
        // Other necessary things

        // const result = await pool.query(
        //     `QUERY WILL BE WRITTEN HERE`, [__, __, __, __]
        // );

        res.status(200).json({
            message: 'User Synced Successfully',
            // user: result.rows[0];
        });
    } 
    catch(err){
        next(err);
    }
};

module.exports = {syncUser};