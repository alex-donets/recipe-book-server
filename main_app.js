const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/config');
const dotenv = require('dotenv');
const socketIo = require('socket.io');

dotenv.config();

mongoose.connect(process.env.DB_PATH, {
    user: config.dbUser,
    pass: config.dbPass,
    useNewUrlParser: true
});

mongoose.connection.on('connected', () => {
    console.log('Database connected: ' + process.env.DB_PATH);
});

mongoose.connection.on('error', (err) => {
    console.log('Database error: ' + err);
});

const app = express();
const server = http.createServer(app);

const io = socketIo(server);

const port = process.env.SERVER_PORT || 8080;

app.use(cors({
    credentials: true,
    origin: process.env.WEB_APP_URL,
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
    res.redirect(`${process.env.WEB_APP_URL}`);
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
