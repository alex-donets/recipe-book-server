const express = require('express');
const multer = require('multer');
const fs = require('fs');
const passport = require('passport');
const jwt_decode = require('jwt-decode');

const router = express.Router();

const Recipe = require('../models/recipe');

const upload = multer({
    dest: 'uploads/',
});

router.get('/', (req, res, next) => {
    Recipe.getAllRecipes((err, recipeList) => {
        if (err) {
            res.status(400).json({ msg: 'Failed to get recipes - ' + err });
        } else {
            res.json(recipeList);
        }
    });
});

router.get('/:id', (req, res, next) => {
    Recipe.getRecipeByCategoryId(req.params.id, (err, dataList) => {
        if (err) {
            res.status(400).json({ msg: 'Failed to get recipes - ' + err });
        } else {
            res.json(dataList);
        }
    });
});

router.get('/get/:id', (req, res, next) => {
    Recipe.getRecipeById(req.params.id, (err, dataList) => {
        if (err) {
            res.status(400).json({ msg: 'Failed to get recipes - ' + err });
        } else {
            res.json(dataList);
        }
    });
});

router.get('/get/photo/:id', (req, res) => {
    Recipe.getRecipePhotoById(req.params.id, (err, photo) => {
        if (err) {
            res.status(400).json({ msg: 'Failed to get photo by Id' + err });
        } else {
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(photo.photo.data, 'binary');
        }
    });
});


router.post('/add', upload.single('file'), (req, res) => {
    Recipe.getRecipeByName(req.body.name, (err, recipe) => {
        if (err) {
            res.status(400).json({ msg: 'Failed to check recipe by name: ' + err });
        } else if (recipe) {
            res.status(400).json({ msg: 'Recipe with the same name already exists' });
        } else {
            const ingredients = JSON.parse(req.body.ingredients);

            let newRecipe = new Recipe({
                name: req.body.name,
                userId: req.body.userId,
                categoryId: req.body.categoryId,
                ingredients: ingredients,
                directions: req.body.directions
            });

            if (req.file) {
                newRecipe.photo.data = fs.readFileSync(req.file.path);
                newRecipe.photo.contentType = req.file.mimetype;
                newRecipe.photo.originalName = req.file.originalname;
                newRecipe.photo.size = req.file.size;
            }

            Recipe.createRecipe(newRecipe, (err, recipe) => {
                if (err) {
                    res.status(400).json({ msg: 'Failed to add recipe: ' + err });
                } else {
                    const { _id, photo, name, ingredients, categoryId, userId, directions } = recipe;

                    res.status(200).json({ _id, photo, name, ingredients, categoryId, userId, directions });
                }
            });
        }
    })
});

router.post('/update/:id', upload.single('file'), (req, res) => {
    Recipe.getRecipeById(req.params.id, (err, recipe) => {
        if (err) {
            res.status(400).json({ msg: 'Failed to update recipe: ' + err });
        } else {
            const ingredients = JSON.parse(req.body.ingredients);

            let newRecipe = new Recipe({
                name: req.body.name,
                userId: req.body.userId,
                categoryId: req.body.categoryId,
                ingredients: ingredients,
                directions: req.body.directions,
                _id: req.params.id
            });

            if (req.file) {
                newRecipe.photo.data = fs.readFileSync(req.file.path);
                newRecipe.photo.contentType = req.file.mimetype;
                newRecipe.photo.originalName = req.file.originalname;
                newRecipe.photo.size = req.file.size;
            }

            Recipe.updateRecipe(newRecipe, (err, recipe) => {
                if (err) {
                    res.status(400).json({ msg: 'Failed to update recipe: ' + err.message });
                } else {
                    const { _id, photo, name, ingredients, categoryId, userId, directions } = recipe;
                    res.status(200).json({ _id, photo, name, ingredients, categoryId, userId, directions });
                }
            });
        }
    })
});


router.delete('/:id', (req, res) => {
    Recipe.removeRecipe(req.params.id, (err) => {
        if (err) {
            res.status(400).json({ msg: 'Failed to delete recipe - ' + err });
        } else {
            res.status(200).json({ msg: 'Recipe deleted.' });
        }
    });
});

module.exports = router;
