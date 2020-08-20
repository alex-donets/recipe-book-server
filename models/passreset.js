const mongoose = require('mongoose');
const config = require('../config/config');

const PassResetSchema = mongoose.Schema({
    datetime: String,
    ip: String,
    email: String
}, { collection: config.dbPrefix + 'passresets' });

PassResetSchema.index({ location: "2dsphere" });

const PassReset = module.exports = mongoose.model('PassReset', PassResetSchema);

module.exports.getAllPassResets = function (callback) {
    PassReset.find(callback);
};

module.exports.getPassResetById = function (id, callback) {
    PassReset.findById(id, callback);
};

module.exports.addPassReset = function (newPassReset, callback) {
    var upsertData = newPassReset.toObject();
    delete upsertData._id;
    PassReset.update({ _id: newPassReset._id }, upsertData, { upsert: true }, callback);
};

module.exports.removePassReset = function (id, callback) {
    PassReset.remove({ _id: id }, callback);
};
