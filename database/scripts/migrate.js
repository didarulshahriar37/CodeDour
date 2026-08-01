const path = require('path');
const fs = require('fs');

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

// Load .env from backend/.env
dotenv.config({ path: path.join(__dirname, '../../backend/.env') });

async function runMigration() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('Error: DATABASE_URL is not defined in backend/.env');
        process.exit(1);
    }

    console.log('Connecting to NeonDB database...');
    const pool = new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        const initSqlPath = path.join(__dirname, '../migrations/init.sql');
        console.log(`Reading SQL script from: ${initSqlPath}`);
        const sql = fs.readFileSync(initSqlPath, 'utf8');

        console.log('Executing database initialization script on NeonDB...');
        await pool.query(sql);
        console.log('Successfully executed database initialization script on NeonDB!\n');

        // Run validation queries
        console.log('--- Validating Database Setup ---');
        
        const tablesRes = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        console.log('Created Tables:', tablesRes.rows.map(r => r.table_name));

        const usersRes = await pool.query('SELECT user_id, username, role, rating FROM users;');
        console.log('\nSeeded Users:');
        console.table(usersRes.rows);

        const problemsRes = await pool.query('SELECT problem_id, title, difficulty FROM problems;');
        console.log('\nSeeded Problems:');
        console.table(problemsRes.rows);

        const viewsRes = await pool.query('SELECT problem_id, title, difficulty, acceptance_rate FROM problem_stats_view;');
        console.log('\nProblem Stats View:');
        console.table(viewsRes.rows);

        const funcsRes = await pool.query('SELECT * FROM get_user_statistics(3);');
        console.log('\nUser Statistics Function Output (for user_id 3):');
        console.table(funcsRes.rows);

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
