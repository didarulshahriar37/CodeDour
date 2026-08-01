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

async function testTriggers() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Testing trigger: Inserting Accepted submission for User 3 (Alice)...');

        // Insert submission
        const subRes = await pool.query(`
            INSERT INTO submissions (user_id, problem_id, language, code, status, execution_time, memory_used)
            VALUES (3, 1, 'cpp', 'int main() { return 0; }', 'Accepted', 0.02, 1024)
            RETURNING submission_id, status;
        `);
        console.log('Inserted Submission:', subRes.rows[0]);

        // Check user stats after trigger
        const userRes = await pool.query('SELECT user_id, username, problems_solved, total_submissions FROM users WHERE user_id = 3;');
        console.log('Updated User Stats:', userRes.rows[0]);

        // Check problem stats after trigger
        const probRes = await pool.query('SELECT problem_id, title, total_submissions, accepted_submissions FROM problems WHERE problem_id = 1;');
        console.log('Updated Problem Stats:', probRes.rows[0]);

        // Check awarded achievements
        const achRes = await pool.query(`
            SELECT u.username, a.title, ua.awarded_at 
            FROM user_achievements ua 
            JOIN users u ON ua.user_id = u.user_id 
            JOIN achievements a ON ua.achievement_id = a.achievement_id
            WHERE u.user_id = 3;
        `);
        console.log('Awarded Achievements:', achRes.rows);

    } catch (err) {
        console.error('Trigger Test Failed:', err);
    } finally {
        await pool.end();
    }
}

testTriggers();
