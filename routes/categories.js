const express = require('express');
const multer = require('multer');
const fs = require('fs');
const passport = require('passport');

const router = express.Router();

const Category = require('../models/category');

const upload = multer({
    dest: 'uploads/',
});

router.get('/', (req, res, next) => {
    Category.getAllCategories((err, categoryList) => {
        if (err) {
            res.status(400).json({ msg: 'Failed to get categories - ' + err });
        } else {
            // TODO: return base64, not a text array
            res.json(categoryList);
        }
    });
});

router.get('/data', (req, res, next) => {
    Category.getAllCategories((err, dataList) => {
        if (err) {
            res.status(400).json({ msg: 'Failed to get categories - ' + err });
        } else {
            res.json(dataList);
        }
    });
});

router.get('/get/photo/:id', (req, res) => {
    Category.getCategoryPhotoById(req.params.id, (err, photo) => {
        if (err) {
            res.status(400).json({ msg: 'Failed to get photo by Id' + err });
        } else {
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(photo.photo.data, 'binary');
        }
    });
});


router.post('/add', upload.single('file'), (req, res) => {
    Category.getCategoryByName(req.body.name, (err, category) => {
        if (err) {
            res.status(400).json({ msg: 'Failed to check category by name: ' + err });
        } else if (category) {
            res.status(400).json({ msg: 'Category with the same name already exists' });
        } else {
            let newCategory = new Category({
                name: req.body.name,
            });

            if (req.file) {
                newCategory.photo.data = fs.readFileSync(req.file.path);
                newCategory.photo.contentType = req.file.mimetype;
                newCategory.photo.originalName = req.file.originalname;
                newCategory.photo.size = req.file.size;
            }

            Category.createCategory(newCategory, (err, category) => {
                if (err) {
                    res.status(400).json({ msg: 'Failed to add category: ' + err });
                } else {
                    const { _id, photo, name } = category;

                    res.status(200).json({ _id, photo, name });
                }
            });
        }
    })
});

router.post('/update/:id', upload.single('file'), (req, res) => {
    Category.getCategoryById(req.params.id, (err, category) => {
        if (err) {
            res.status(400).json({ msg: 'Failed to update category: ' + err });
        } else {
            let newCategory = new Category({
                name: req.body.name,
                _id: req.params.id
            });

            if (req.file) {
                newCategory.photo.data = fs.readFileSync(req.file.path);
                newCategory.photo.contentType = req.file.mimetype;
                newCategory.photo.originalName = req.file.originalname;
                newCategory.photo.size = req.file.size;
            }

            Category.updateCategory(newCategory, (err, category) => {
                if (err) {
                    res.status(400).json({ msg: 'Failed to update category: ' + err.message });
                } else {
                    const { _id, photo, name } = category;
                    console.log('upd')
                    res.status(200).json({ _id, photo, name });
                }
            });
        }
    })
});


router.delete('/:id', (req, res) => {
    Category.removeCategory(req.params.id, (err) => {
        if (err) {
            res.status(400).json({ msg: 'Failed to delete category - ' + err });
        } else {
            res.status(200).json({ msg: 'Category deleted.' });
        }
    });
});

module.exports = router;
