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
            res.json({ success: false, msg: 'Failed to get categories - ' + err });

        } else {
            // TODO: return base64, not a text array
            res.json({ success: true, list: categoryList });
        }
    });
});

router.get('/get/photo/:id', (req, res) => {
    Category.getCategoryPhotoById(req.params.id, (err, photo) => {
        if (err) {
            res.json({ success: false, msg: 'Failed to get photo by Id' + err });
        } else {
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(photo.photo.data, 'binary');
            // res.json({ success: true, photo: photo });
        }
    });
});


router.post('/add', upload.single('file'), (req, res) => {
    console.log('body', req.body)
    console.log('photo', req.file)

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

            Category.saveCategory(newCategory, (err, category) => {
                if (err) {
                    res.status(400).json({ msg: 'Failed to add category: ' + err });
                } else {
                    res.status(200).json({ category });
                }
            });
        }
    })
});


router.delete('/remove/:id', passport.authenticate('admin-rule', { session: false }), (req, res) => {
    // console.log("Req: ", req.params);
    Category.removeCategory(req.params.id, (err) => {
        if (err) {
            res.json({ success: false, msg: 'Failed to delete category - ' + err });
        } else {
            res.json({ success: true, msg: 'Category deleted.' });
        }
    });
});

router.post('/rate/:id/:score', passport.authenticate('user-rule', { session: false }), (req, res) => {
    Category.getCategoryById(req.params.id, (err, category) => {
        if (err) {
            res.json({ success: false, msg: 'Can\'t find category. ' + err });
        } else {
            const sumScores = Number(category.rating.result) * Number(category.rating.votes) + Number(req.params.score);
            category.rating.votes = category.rating.votes + 1;
            category.rating.result = (sumScores / category.rating.votes).toFixed(1);

            Category.saveCategory(category, (err) => {
                if (err) {
                    res.json({ success: false, msg: 'Failed to rate category - ' + err });
                } else {
                    res.json({ success: true, msg: 'Category rated.', category: category });
                }
            });
        }
    });
});

module.exports = router;
