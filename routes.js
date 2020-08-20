const express = require('express');
const path = require('path');

const photos = require('./routes/photos');
const users = require('./routes/users');

module.exports = function (app) {

    app.use(express.static(path.join(__dirname, 'web')));

    app.use('/photos', photos);
    app.use('/users', users);
};
