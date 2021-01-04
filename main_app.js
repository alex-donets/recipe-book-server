const { envVars, getWebUrl, getDbPath } = require("./helpers");

const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/config');
const dotenv = require('dotenv');
const socketIo = require('socket.io');

dotenv.config();

const app = express();

const prodEnv = process.env.NODE_ENV === envVars.prod;

const env = process.env.NODE_ENV;
const webUrl = getWebUrl(env);

const opts = {
    key: fs.readFileSync("./key.pem"),
    cert: fs.readFileSync("./server.crt"),
};

const devServer = http.createServer(app);
const prodServer = https.createServer(opts, app);
const dbPath = getDbPath(env);

console.log('ENVIRONMENT: ', env);
console.log('WEB_APP_URL: ', webUrl);
console.log('DB_PATH: ', dbPath);

mongoose.connect(dbPath, {
    user: config.dbUser,
    pass: config.dbPass,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Database connected: ' + dbPath);
});

mongoose.connection.on('error', (err) => {
    console.log('Database error: ' + err);
});

const server = prodEnv ? prodServer : devServer;

const io = socketIo(server);

const port = process.env.SERVER_PORT || 8080;

app.use(cors({
    credentials: true,
    origin: webUrl,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(passport.initialize());

/**
 * Load commons
 */

require('./config/passport')(passport);
require('./schedulers/schedule-list');


/**
 *  Routes
 */

require('./routes')(app);
require('./routes/chat-messages.js')(io);

app.get('*', (req, res) => {
    res.redirect(`${webUrl}`);
});

app.use((err, req, res, next) => {
    if(err.stack) {
        console.error(err.stack);
    } else {
        console.error(err);
    }
    const status = err.status ? err.status : 200;
    res.status(status).json({ msg: err.message });
});

server.listen(port, () => {
    console.log(`Recipe-Book-App started on port ${port}`);
});

module.exports = io;
