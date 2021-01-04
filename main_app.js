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

const opts = {
    key: fs.readFileSync("./key.pem"),
    cert: fs.readFileSync("./server.crt"),
};

const devEnv = process.env.NODE_ENV === 'dev';
const devServer = http.createServer(app);
const prodServer = https.createServer(opts, app);
const dbPath = devEnv ? process.env.DB_PATH_LOCAL : process.env.DB_PATH_IMAGE;

mongoose.connect(dbPath, {
    user: config.dbUser,
    pass: config.dbPass,
    useNewUrlParser: true
});

mongoose.connection.on('connected', () => {
    console.log('Database connected: ' + dbPath);
});

mongoose.connection.on('error', (err) => {
    console.log('Database error: ' + err);
});

const server = devEnv ? devServer : prodServer;

const io = socketIo(server);

const port = process.env.SERVER_PORT || 8080;

const webUrl = devEnv ? process.env.WEB_APP_URL_DEV : process.env.WEB_APP_URL_PROD;

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

console.log('ENVIRONMENT: ', process.env.NODE_ENV);
console.log('WEB_APP_URL: ', webUrl);
console.log('DB_PATH: ', dbPath);

module.exports = io;
