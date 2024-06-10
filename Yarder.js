const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let chatHistory = [];
let usernames = new Set();

let admin = "";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Admin kullanıcı adını girin: ', (answer) => {
    admin = answer;
    console.log('Admin kullanıcı adı:', admin);

    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('set username', (username) => {
            if (usernames.has(username)) {
                socket.emit('username exists');
            } else {
                usernames.add(username);
                socket.username = username;

                console.log(`Username set: ${username}`);

                chatHistory.forEach((item) => {
                    if (item.type === 'message') {
                        socket.emit('chat message', item);
                    } else if (item.type === 'file') {
                        socket.emit('file upload', item);
                    }
                });
            }
        });

        socket.on('disconnect', () => {
            if (socket.username) {
                usernames.delete(socket.username);
                console.log(`User disconnected: ${socket.username}`);
            }
        });

        socket.on('chat message', (data) => {
            if (data.username === admin && data.message === 'cls') {
                chatHistory = [];
                io.emit('clear chat');
            } else {
                const messageData = { id: uuidv4(), type: 'message', username: data.username, message: data.message, timestamp: Date.now() };
                chatHistory.push(messageData);
                io.emit('chat message', messageData);
            }
        });

        socket.on('file upload', (data) => {
            const fileData = { id: uuidv4(), type: 'file', username: data.username, fileName: data.fileName, fileData: data.fileData, timestamp: Date.now() };
            chatHistory.push(fileData);
            io.emit('file upload', fileData);
        });

        socket.on('delete message', function (msg) {
            chatHistory = chatHistory.filter(item => item.id !== msg.id);
            io.emit('message deleted', msg);
        });

        socket.on('delete file', function(data){
            chatHistory = chatHistory.filter(item => item.id !== data.id);
            io.emit('file deleted', data);
        })
    });

    rl.question('Port Giriniz: ', (ans) => {
        const port = ans;
        server.listen(port, () => {
            console.log(`listening on: ${port}`);
        });
        rl.close();
    });
});
