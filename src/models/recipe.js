const mongoose = require('mongoose');
const fs = require('fs');

const RecipeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    categoryId: {
        type: String,
        required: true
    },
    photo: {
        data: Buffer,
        contentType: String,
        originalName: String,
        size: Number
    },
    ingredients: {
        type: Array,
        required: true
    },
    directions: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Number,
        required: true
    }
}, { collection: process.env.DB_PREFIX + 'recipes' });

const Recipe = mongoose.model('Recipe', RecipeSchema);

const getRecipeById = (id) => Recipe.findById(id);

const getRecipeByCategoryId = (categoryId) => Recipe.find({ categoryId }, '_id name userId ingredients categoryId directions updatedAt');

const getRecipeByName = (name) => Recipe.findOne({ name });

const getRecipePhotoById = (id) => Recipe.findById(id, 'photo');

const updateRecipe = async(newRecipe) => {
    try {
        const options = {
            new: true,
            useFindAndModify: false,
        };

        const updatedRecipe = await Recipe.findOneAndUpdate({ _id: newRecipe._id }, newRecipe, options);

        return updatedRecipe;
    } catch (e) {
        throw new Error(e);
    }
};

const addRecipe = (newRecipe) => Recipe.create(newRecipe);

const removeRecipe = (_id) => Recipe.remove({ _id });

const createRecipe = (name, userId, categoryId, ingredients, directions, file, _id, updatedAt) => {
    try {
        const newRecipe = new Recipe({
            name,
            userId,
            categoryId,
            ingredients,
            directions,
            _id,
            updatedAt
        });

        if (file) {
            newRecipe.photo.data = fs.readFileSync(file.path);
            newRecipe.photo.contentType = file.mimetype;
            newRecipe.photo.originalName = file.originalname;
            newRecipe.photo.size = file.size;
        }

        return newRecipe;
    } catch (e) {
        throw new Error(e);
    }
};

module.exports = {
    Recipe,
    getRecipeById,
    getRecipeByCategoryId,
    getRecipeByName,
    getRecipePhotoById,
    updateRecipe,
    createRecipe,
    addRecipe,
    removeRecipe
};
