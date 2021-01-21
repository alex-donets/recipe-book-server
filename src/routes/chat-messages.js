const Chat = require('../models/chat');

const getAllMessages = (io) => {
    Chat.getAllMessages((err, dataList) => {
        if (err) {
            io.sockets.emit("errors", `Error getting messages: ${err}`);
            console.log('error get-messages', err);
        } else {
            const messageList = dataList.map(item => {

                return {
                    id: item._id,
                    message: item.message,
                    timestamp: item.timestamp,
                    user: item.user
                };
            });

            io.sockets.emit("get-messages", messageList);
        }
    });
};

const io = (io) => {
    io.on('connection', (socket) => {
        if (!socket) {
            io.sockets.emit("errors", `Error getting connection`);
        } else {
            console.log("New client connected: " + socket.id);

            socket.on("get-messages", () => {
                getAllMessages(io);
            });

            socket.on("add-message", (data) => {
                const date = new Date();
                const timestamp = date.getTime();

                const newMessage = new Chat({
                    message: data.message,
                    user: {
                        id: data.user.id,
                        fullName: data.user.fullName,
                    },
                    timestamp,
                });

                Chat.addMessage(newMessage,(err) => {
                    if (err) {
                        io.sockets.emit("errors", `Error adding message: ${err}`);
                        console.log('error add message', err);
                    } else {
                        getAllMessages(io);
                    }
                });
            });

            socket.on("disconnect", () => {
                console.log("Client disconnected");
            });
        }
    });
};

module.exports = io;
