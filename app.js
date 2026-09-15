require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var emailsRouter = require('./routes/emails');
var threatScoresRouter = require('./routes/threatScores');
var senderLocationsRouter = require('./routes/senderLocations');
var forensicLogsRouter = require('./routes/forensicLogs');
var dashboardRouter = require('./routes/dashboard');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/dashboard', dashboardRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

app.use('/', indexRouter);
app.use('/api/emails', emailsRouter);
app.use('/api/threat-scores', threatScoresRouter);
app.use('/api/sender-locations', senderLocationsRouter);
app.use('/api/forensic-logs', forensicLogsRouter);

module.exports = app;