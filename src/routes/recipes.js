const express = require('express');
const multer = require('multer');
const passport = require('passport');
const router = express.Router();
const Recipe = require('../models/recipe');
const { updateValidationSchema, addValidationSchema } = require('../validations/recipe');
const sanitize = require('mongo-sanitize');
const upload = multer({
  dest: 'uploads/'
});

router.get('/:id', async(req, res) => {
  try {
    const id = sanitize(req.params.id);
    const recipeList = await Recipe.getRecipeByCategoryId(id);

    res.status(200).json(recipeList);
  } catch (e) {
    res.status(400).json({ msg: 'Failed to get recipes - ' + e });
  }
});

router.get('/get/photo/:id/:timestamp', async (req, res) => {
  try {
    const id = sanitize(req.params.id);
    const photo = await Recipe.getRecipePhotoById(id);

    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(photo.photo.data, 'binary');
  } catch (e) {
    res.status(400).json({ msg: 'Failed to get photo: ' + e });
  }
});

router.post('/add', passport.authenticate('user', { session: false }), upload.single('file'), async(req, res) => {
  try {
    const ingredientList = JSON.parse(req.body.ingredients);

    const data = {
      name: sanitize(req.body.name),
      photo: sanitize(req.file),
      categoryId: sanitize(req.body.categoryId),
      userId: sanitize(req.body.userId),
      directions: sanitize(req.body.directions),
      ingredients: sanitize(ingredientList)
    };

    await addValidationSchema.isValid(data);

    const existedRecipe = await Recipe.getRecipeByName(data.name);

    if (existedRecipe) {
      return res.status(400).json({ msg: 'Recipe with the same name already exists' });
    }

    const createdRecipe = Recipe.createRecipe(
        data.name,
        data.userId,
        data.categoryId,
        data.ingredients,
        data.directions,
        data.photo
    );

    const newRecipe = await Recipe.addRecipe(createdRecipe);

    if (!newRecipe) {
      return res.status(400).json({ msg: 'Cannot add a recipe' });
    }

    const { _id, name, ingredients, categoryId, userId, directions, updatedAt } = newRecipe;

    res.status(200).json({ _id, name, ingredients, categoryId, userId, directions, updatedAt });
  } catch (e) {
    res.status(400).json({ msg: 'Failed to add recipe: ' + e });
  }
});

router.post('/update/:id', passport.authenticate('user', { session: false }), upload.single('file'), async(req, res) => {
  try {
    const ingredientList = JSON.parse(req.body.ingredients);

    const data = {
      id: sanitize(req.params.id),
      name: sanitize(req.body.name),
      photo: sanitize(req.file),
      userId: sanitize(req.body.userId),
      categoryId: sanitize(req.body.categoryId),
      ingredients: sanitize(ingredientList),
      directions: sanitize(req.body.directions),
    };

    await updateValidationSchema.validate(data);

    const recipe = await Recipe.getRecipeById(data.id);

    if (!recipe) {
      return res.status(400).json({ msg: 'Recipe not found' });
    }

    const timestamp = Date.now().toFixed();

    const createdRecipe = Recipe.createRecipe(
        data.name,
        data.userId,
        data.categoryId,
        data.ingredients,
        data.directions,
        data.photo,
        data.id,
        timestamp
    );

    const newRecipe = await Recipe.updateRecipe(createdRecipe);

    if (!newRecipe) {
      return res.status(400).json({ msg: 'Cannot update a recipe' });
    }

    const { _id, name, ingredients, categoryId, userId, directions, updatedAt } = newRecipe;

    res.status(200).json({ _id, name, ingredients, categoryId, userId, directions, updatedAt });
  } catch (e) {
    res.status(400).json({ msg: 'Failed to update recipe: ' + e });
  }
});

router.delete('/:id', passport.authenticate('user', { session: false }), async(req, res) => {
  try {
    const id = sanitize(req.params.id);
    const recipe = await Recipe.removeRecipe(id);

    if (!recipe) {
      return res.status(400).json({ msg: 'Failed to delete a recipe' });
    }

    res.status(200).json({ msg: 'Recipe deleted' });
  } catch (e) {
    res.status(400).json({ msg: 'Failed to delete a recipe: ' + e });
  }
});

module.exports = router;
