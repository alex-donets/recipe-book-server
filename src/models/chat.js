const mongoose = require('mongoose');

const ChatSchema = mongoose.Schema(
  {
    message: {
      type: String,
      required: true
    },
    user: {
      id: String,
      fullName: String
    },
    timestamp: {
      type: Number,
      required: true
    }
  },
  { collection: process.env.DB_PREFIX + 'chat' }
);

const Chat = module.exports = mongoose.model('Chat', ChatSchema);

module.exports.getAllMessages = function (callback) {
    Chat.find({}, 'message userId timestamp user', callback);
};

module.exports.addMessage = function (newMessage, callback) {
    Chat.create(newMessage, callback);
};

module.exports.deleteAllMessages = function ( callback) {
    Chat.remove({}, callback);
};
