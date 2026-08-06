const express = require('express');
const cors = require('cors');
const {errorHandler} = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/problems', require('./routes/problem.routes'));
app.use('/api/submissions', require('./routes/submission.routes'));
app.use('/api/leaderboard', require('./routes/leaderboard.routes'));
app.use('/api/achievements', require('./routes/achievement.routes'));
app.use('/api/tags', require('./routes/tag.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
// app.use('/api/contests', require('./routes/contest.routes'));

app.get('/health', (req, res) => {
    res.status(200).json({status: 'ok', message: 'CodeDour is running'});
});

app.use(errorHandler);
module.exports = app;