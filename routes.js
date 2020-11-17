const express = require('express');
const path = require('path');

const home = require('./routes/home');
const photos = require('./routes/photos');
const users = require('./routes/users');
const categories = require('./routes/categories');

module.exports = function (app) {

    app.use(express.static(path.join(__dirname, 'web')));

    app.use('/home', home);
    app.use('/photos', photos);
    app.use('/users', users);
    app.use('/categories', categories);
};
