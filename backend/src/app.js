const express = require('express');
const cors = require('cors');
const {errorHandler} = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({status: 'ok', message: 'CodeDour is running'});
});

app.use(errorHandler);
module.exports = app;