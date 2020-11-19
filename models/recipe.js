const config = require('../config/config');
const mongoose = require('mongoose');

const RecipeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    photo: {
        data: Buffer,
        contentType: String,
        originalName: String,
        size: Number,
    },
    ingredients: [],
}, { collection: config.dbPrefix + 'recipes' });

const Recipe = module.exports = mongoose.model('Recipe', RecipeSchema);

module.exports.getAllRecipes = function (callback) {
    Recipe.find({}, 'name userId photo ingredients', callback);
};

module.exports.getRecipeById = function (id, callback) {
    return Recipe.findById(id, callback);
};

module.exports.getRecipePhotoById = function (id, callback) {
    Recipe.findById(id, 'photo', callback);
};

module.exports.getRecipeByName = function (recipe, callback) {
    const query = { name: recipe };
    Recipe.findOne(query, callback);
};

module.exports.updateRecipe = function (newRecipe, callback) {
    Recipe.findByIdAndUpdate({ _id: newRecipe._id }, newRecipe, {new: true}, callback);
};

module.exports.createRecipe = function (newRecipe, callback) {
    Recipe.create(newRecipe, callback);
};

module.exports.removeRecipe = function (id, callback) {
    Recipe.remove({_id: id}, callback);
};

module.exports.getCategoriesByIds = function (ids) {
    return Recipe.find({
        _id: {
            $in: ids
        }
    }).exec();
};
