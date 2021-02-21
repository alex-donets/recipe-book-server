const express = require('express');
const multer = require('multer');
const passport = require('passport');
const router = express.Router();
const Category = require('../models/category');
const upload = multer({ dest: 'uploads/' });
const { updateValidationSchema, addValidationSchema } = require('../validations/category');
const sanitize = require('mongo-sanitize');

router.get(
  '/',
  async (req, res) => {
    try {
      const categoryList = await Category.getAllCategories();

      if (!categoryList) {
        return res.status(400).json({ msg: 'Failed to get categories' });
      }

      res.status(200).json(categoryList);
    } catch (e) {
      res.status(400).json({ msg: 'Failed to get categories: ' + e });
    }
  }
);

router.get('/get/photo/:id/:timestamp', async(req, res) => {
  try {
    const id = sanitize(req.params.id);
    const photo = await Category.getCategoryPhotoById(id);

    if (photo) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(photo.photo.data, 'binary');
    } else {
      res.json({ msg: "Photo doesn't exist" });
    }
  } catch (e) {
    res.status(400).json({ msg: 'Failed to get photo:' + e });
  }
});

router.post('/add', passport.authenticate('admin', { session: false }), upload.single('file'), async(req, res) => {
  try {
    const data = {
      name: sanitize(req.body.name),
      photo: sanitize(req.file)
    };

    await addValidationSchema.validate(data);

    const existedCategory = await Category.getCategoryByName(data.name);

    if (existedCategory) {
      return res.status(400).json({ msg: 'Category with the same name already exists' });
    }

    const createdCategory = Category.createCategory(data.name, data.photo);

    const newCategory = await Category.addCategory(createdCategory);

    if (!newCategory) {
      return res.status(400).json({ msg: 'Cannot create a category' });
    }

    const { _id, name, updatedAt } = newCategory;

    res.status(200).json({ _id, name, updatedAt });
  } catch (e) {
    res.status(400).json({ msg: 'Failed to add category: ' + e });
  }
});

router.post('/update/:id', passport.authenticate('admin', { session: false }), upload.single('file'), async(req, res) => {
  try {
    const data = {
      id: sanitize(req.params.id),
      name: sanitize(req.body.name),
      photo: sanitize(req.file)
    };

    await updateValidationSchema.validate(data);

    const category = await Category.getCategoryById(data.id);

    if (!category) {
      return res.status(400).json({ msg: 'Category not found' });
    }

    const newCategory = Category.createCategory(data.name, data.photo, data.id);

    if (!newCategory) {
      return res.status(400).json({ msg: 'Cannot update a category' });
    }

    const updatedCategory = await Category.updateCategory(newCategory);

    if (!updatedCategory) {
      return res.status(400).json({ msg: 'Cannot update a category' });
    }

    const { _id, photo, name, updatedAt } = updatedCategory;
    res.status(200).json({ _id, photo, name, updatedAt });

  } catch (e) {
    res.status(400).json({ msg: 'Cannot update a category: ' + e });
  }
});

router.delete('/:id', passport.authenticate('admin', { session: false }), async(req, res) => {
  try {
    const id = sanitize(req.params.id);
    const category = await Category.removeCategory(id);

    if (!category) {
      return res.status(400).json({ msg: 'Failed to delete category' });
    }

    res.status(200).json({ msg: 'Category deleted' });
  } catch (e) {
    res.status(400).json({ msg: 'Failed to delete category:' + e });
  }
});

module.exports = router;
