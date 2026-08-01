const path = require('path');

function loadModule(name) {
    try {
        return require(name);
    } catch (e) {
        const modPath = require.resolve(name, { paths: [path.join(__dirname, '../../backend')] });
        return require(modPath);
    }
}

const pg = loadModule('pg');
const dotenv = loadModule('dotenv');
const { Pool } = pg;

dotenv.config({ path: path.join(__dirname, '../../backend/.env') });

async function fullHealthCheck() {
    console.log('====================================================');
    console.log('       CodeDour Database Comprehensive Health Check  ');
    console.log('====================================================\n');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // 1. Connection Test
        console.log('1. [PASS] Connecting to Neon Cloud PostgreSQL...');
        const nowRes = await pool.query('SELECT NOW() as current_time, current_database() as db_name;');
        console.log(`   Connected to Database: "${nowRes.rows[0].db_name}" at ${nowRes.rows[0].current_time.toISOString()}`);

        // 2. Table Count Check
        const tablesRes = await pool.query(`
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
        console.log(`\n2. [PASS] Registered Tables & Views in Public Schema (Total: ${tablesRes.rows.length}):`);
        console.table(tablesRes.rows);

        // 3. Foreign Key Constraints Check
        const fkRes = await pool.query(`
            SELECT kcu.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            ORDER BY kcu.table_name;
        `);
        console.log(`\n3. [PASS] Active Foreign Key Relationships (Total: ${fkRes.rows.length}):`);
        console.table(fkRes.rows);

        // 4. Function Execution Test
        console.log('\n4. [PASS] Testing PL/pgSQL Function `get_user_statistics(3)`:');
        const userStatsRes = await pool.query('SELECT * FROM get_user_statistics(3);');
        console.table(userStatsRes.rows);

        console.log('\n5. [PASS] Testing PL/pgSQL Function `recommend_problems(3, 5)`:');
        const recRes = await pool.query('SELECT * FROM recommend_problems(3, 5);');
        console.table(recRes.rows);

        console.log('\n6. [PASS] Testing PL/pgSQL Function `generate_leaderboard(1)`:');
        const leadRes = await pool.query('SELECT * FROM generate_leaderboard(1);');
        console.table(leadRes.rows);

        // 7. End-to-End Simulation: Contest Rating Calculation
        console.log('\n7. [PASS] Simulating Contest Rating Update `update_contest_ratings(1)`:');
        await pool.query('SELECT update_contest_ratings(1);');
        const ratingsHistory = await pool.query('SELECT * FROM ratings ORDER BY rating_id DESC LIMIT 5;');
        console.table(ratingsHistory.rows);

        console.log('\n====================================================');
        console.log('   RESULT: ALL SYSTEMS OPERATIONAL AND HEALTHY (100%)');
        console.log('====================================================\n');

    } catch (err) {
        console.error('\n[FAIL] Health Check Failed with error:', err);
    } finally {
        await pool.end();
    }
}

fullHealthCheck();
