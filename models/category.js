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

module.exports.saveCategory = function (newCategory, callback) {
    // newCategory.save(callback);

    // https://stackoverflow.com/a/7855281/1119611
    let upsertData = newCategory.toObject();
    delete upsertData._id;
    delete upsertData.__v;

    Category.update({ _id: newCategory._id }, upsertData, { upsert: true }, callback);
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

