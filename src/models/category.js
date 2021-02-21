const mongoose = require('mongoose');
const fs = require('fs');

const CategorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        updatedAt: {
            type: Number,
            required: true
        },
        photo: {
            data: Buffer,
            contentType: String,
            originalName: String,
            size: Number,
            timestamp: Number
        }
    },
    { collection: process.env.DB_PREFIX + 'categories' }
);

const Category = mongoose.model('Category', CategorySchema);

const getAllCategories = () => Category.find({}, 'name updatedAt');

const getCategoryById = (id) => Category.findById(id);

const getCategoryPhotoById = (id) => Category.findById(id, 'photo');

const getCategoryByName = (category) => Category.findOne({ name: category });

const updateCategory = async(newCategory) => {
    try {
        const options = {
            new: true,
            useFindAndModify: false,
        };

        const updatedCategory = await Category.findOneAndUpdate({ _id: newCategory._id }, newCategory, options);

        return updatedCategory;
    } catch (e) {
        throw new Error(e);
    }
};

const addCategory = (newCategory) => Category.create(newCategory);

const removeCategory = (id) => Category.deleteOne({ _id: id });

const createCategory = (name, file, id) => {
    try {
        const newCategory = new Category({
            name: name,
            _id: id,
            updatedAt: Date.now().toFixed()
        });

        if (file) {
            newCategory.photo.data = fs.readFileSync(file.path);
            newCategory.photo.contentType = file.mimetype;
            newCategory.photo.originalName = file.originalname;
            newCategory.photo.size = file.size;
        }

        return newCategory;
    } catch (e) {
        throw new Error(e);
    }
};

module.exports = {
    Category,
    getAllCategories,
    getCategoryById,
    getCategoryPhotoById,
    getCategoryByName,
    updateCategory,
    addCategory,
    removeCategory,
    createCategory
};
