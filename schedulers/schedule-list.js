const schedule = require('node-schedule');
const Chat = require('../models/chat');

schedule.scheduleJob({
    hour: 22,
    minute: 37,
    dayOfWeek: [0, 1, 2, 3, 4, 5, 6]
}, function() {
   Chat.deleteAllMessages((err) => {
        if (err) {
            console.error('Failed to delete messages: ' + err);
        } else {
            console.log('Chat messages has been deleted.');
        }
    });
});
