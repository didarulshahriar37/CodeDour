const fs = require('fs');
const path = require('path');

function parseSqlQueries(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const queries = {};
    const blocks = content.split(/--\s*Name:\s*/);

    for (const block of blocks) {
        if (!block.trim()) continue;
        const lines = block.trim().split('\n');
        const queryName = lines[0].trim();
        const querySql = lines.slice(1).join('\n').trim();
        if (queryName && querySql) {
            queries[queryName] = querySql;
        }
    }
    return queries;
}

const users = parseSqlQueries(path.join(__dirname, 'users.queries.sql'));
const problems = parseSqlQueries(path.join(__dirname, 'problems.queries.sql'));
const submissions = parseSqlQueries(path.join(__dirname, 'submissions.queries.sql'));
const contests = parseSqlQueries(path.join(__dirname, 'contests.queries.sql'));
const tags = parseSqlQueries(path.join(__dirname, 'tags.queries.sql'));
const achievements = parseSqlQueries(path.join(__dirname, 'achievements.queries.sql'));
const leaderboard = parseSqlQueries(path.join(__dirname, 'leaderboard.queries.sql'));

module.exports = {
    users,
    problems,
    submissions,
    contests,
    tags,
    achievements,
    leaderboard
};
