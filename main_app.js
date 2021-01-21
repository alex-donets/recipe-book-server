const { envVars, getWebUrl, getDbPath } = require('./helpers');

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const socketIo = require('socket.io');

dotenv.config();

const app = express();

const env = process.env.NODE_ENV;
const webUrl = getWebUrl(env);

const server = http.createServer(app);
const dbPath = getDbPath(env);

console.log('ENVIRONMENT: ', env);
console.log('WEB_APP_URL: ', webUrl);
console.log('DB_PATH: ', dbPath);

mongoose.connect(dbPath, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('Database connected: ' + dbPath);
});

mongoose.connection.on('error', (err) => {
  console.log('Database error: ' + err);
});

const io = socketIo(server);

const port = process.env.PORT || 8080;

app.use(cors({
  credentials: true,
  origin: webUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
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

app.use((err, req, res) => {
  if (err.stack) {
    console.error(err.stack);
  } else {
    console.error(err);
  }
  const status = err.status ? err.status : 200;
  res.status(status).json({ msg: err.message });
});

const host = process.env.NODE_ENV === envVars.dev ? '' : '0.0.0.0';

server.listen(port, host, () => {
  console.log(`Recipe-Book-App started on port: ${port}, host: ${host}`);
});

module.exports = io;
