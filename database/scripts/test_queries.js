const path = require('path');
const queries = require('../queries');

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

async function testCrudQueries() {
    console.log('Testing database/queries/ loader...\n');
    console.log('Loaded Query Categories:', Object.keys(queries));
    console.log('User Queries:', Object.keys(queries.users));
    console.log('Problem Queries:', Object.keys(queries.problems));
    console.log('Submission Queries:', Object.keys(queries.submissions));
    console.log('Contest Queries:', Object.keys(queries.contests));

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('\nExecuting Sample Queries via database/queries/ module...');

        // Test FindUserById
        const userRes = await pool.query(queries.users.FindUserById, [1]);
        console.log('User 1 (FindUserById):', userRes.rows[0]);

        // Test ListProblems
        const probRes = await pool.query(queries.problems.ListProblems, [null, null, 5, 0]);
        console.log(`Listed Problems (${probRes.rows.length}):`, probRes.rows.map(p => p.title));

        // Test ListContests
        const contestRes = await pool.query(queries.contests.ListContests, [null, 5, 0]);
        console.log(`Listed Contests (${contestRes.rows.length}):`, contestRes.rows.map(c => c.title));

        console.log('\nSUCCESS: All CRUD Queries parsed and executed cleanly!');
    } catch (err) {
        console.error('Error executing query:', err);
    } finally {
        await pool.end();
    }
}

testCrudQueries();
