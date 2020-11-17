const express = require('express');

const router = express.Router();

const Category = require('../models/category');

router.get('/', (req, res, next) => {
    Category.getAllCategories((err, categoryList) => {
        if (err) {
            res.status(400).json({ msg: 'Failed to get categories: ' + err });
        } else {
            // TODO: return base64, not a text array
            res.json(categoryList);
        }
    });
});

module.exports = router;
