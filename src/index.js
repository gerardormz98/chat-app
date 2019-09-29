const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { validateUser, addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, '..', 'public');

app.use(express.static(publicDir));

io.on('connection', (socket) => {
    socket.on('validateUser', ({ username, room }, callback) => {
        const result = validateUser({ username, room });

        if (result) {
            return callback(result.error);
        }

        callback();
    });

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });
        
        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage(`Welcome ${user.username}!`, 'Admin'));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`, 'Admin'));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter();
        const user = getUser(socket.id);

        if(filter.isProfane(msg)){
            io.emit('message', generateMessage(filter.clean(msg), user.username));
            return callback('Profanity is not allowed!');
        }

        io.to(user.room).emit('message', generateMessage(msg, user.username));
        callback();
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(coords.lat, coords.long, user.username));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left the chat.`, 'Admin'));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}...`);
});