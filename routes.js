const express = require('express');
const path = require('path');

const users = require('./src/routes/users');
const categories = require('./src/routes/categories');
const recipes = require('./src/routes/recipes');

module.exports = function (app) {
  app.use(express.static(path.join(__dirname, 'web')));

  app.use('/users', users);
  app.use('/categories', categories);
  app.use('/recipes', recipes);
};
