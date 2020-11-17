const config = require('../config/config');
const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    photo: {    // https://medium.com/@alvenw/how-to-store-images-to-mongodb-with-node-js-fb3905c37e6d
        data: Buffer,
        contentType: String,
        originalName: String,
        size: Number,
    },
}, { collection: config.dbPrefix + 'categories' });

const Category = module.exports = mongoose.model('Category', CategorySchema);

module.exports.getAllCategories = function (callback) {
    Category.find({}, 'name photo', callback);
};

module.exports.getCategoryById = function (id, callback) {
    return Category.findById(id, callback);
};

module.exports.getCategoryPhotoById = function (id, callback) {
    Category.findById(id, 'photo', callback);
};

module.exports.getCategoryByName = function (dishName, callback) {
    const query = { name: dishName };
    Category.findOne(query, callback);
};

module.exports.updateCategory = function (newCategory, callback) {
    Category.findByIdAndUpdate({ _id: newCategory._id }, newCategory, {new: true}, callback);
};

module.exports.createCategory = function (newCategory, callback) {
    Category.create(newCategory, callback);
};

module.exports.removeCategory = function (id, callback) {
    Category.remove({_id: id}, callback);
};

module.exports.getCategoriesByIds = function (ids) {
    return Category.find({
        _id: {
            $in: ids
        }
    }).exec();
};

