const express = require('express');
const path = require('path');

const users = require('./routes/users');
const categories = require('./routes/categories');
const recipes = require('./routes/recipes');

module.exports = function (app) {
  app.use(express.static(path.join(__dirname, 'web')));

  app.use('/users', users);
  app.use('/categories', categories);
  app.use('/recipes', recipes);
};
