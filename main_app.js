const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/config');

mongoose.connect(config.dbPath, {
    user: config.dbUser,
    pass: config.dbPass,
    useNewUrlParser: true
});

mongoose.connection.on('connected', () => {
    console.log('Database connected: ' + config.dbPath);
});

mongoose.connection.on('error', (err) => {
    console.log('Database error: ' + err);
});


const app = express();
const port = config.serverPort;


app.use(cors({
    credentials: true,
    origin: config.clientAppURL
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(passport.initialize());

/**
 * Load commons
 */

require('./config/passport')(passport);


/**
 *  Routes
 */

require('./routes')(app);

app.get('*', (req, res) => {
    res.redirect(`${config.clientAppURL}`);
});

app.use((err, req, res, next) => {
    if(err.stack) {
        console.error(err.stack);
    } else {
        console.error(err);
    }
    //TODO return error http status codes
    const status = err.status ? err.status : 200;
    res.status(status).json({ success: false, msg: err });
});


app.listen(port, () => {
    console.log(`Recipe-Book-App started on port ${port}`);
});
