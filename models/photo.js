const mongoose = require('mongoose');
const config = require('../config/config');

const PhotoSchema = mongoose.Schema({
    name: String,
    photo: {    // https://medium.com/@alvenw/how-to-store-images-to-mongodb-with-node-js-fb3905c37e6d
        data: Buffer,
        contentType: String
    }
}, { collection: config.dbPrefix + 'photos' });

PhotoSchema.index({ location: "2dsphere" });

const Photo = module.exports = mongoose.model('Photo', PhotoSchema);

module.exports.getAllPhotos = function (callback) {
    Photo.find(callback);
};

module.exports.getPhotoById = function (id, callback) {
    Photo.findById(id, callback);
};

module.exports.addPhoto = function (newPhoto, callback) {
    const upsertData = newPhoto.toObject();
    delete upsertData._id;
    Photo.update({ _id: newPhoto._id }, upsertData, { upsert: true }, callback);
};

module.exports.removePhoto = function (id, callback) {
    Photo.remove({ _id: id }, callback);
};

module.exports.listNear = function (lon, lat, dist, callback) {
    Photo.find({
        location: {
            $near: {
                $maxDistance: dist,
                $geometry: {
                    type: "Point",
                    coordinates: [lon, lat]
                }
            }
        }
    }).find((error, results) => {
        console.log("Near: ", results, error);
        callback(error, results);
    });
};
