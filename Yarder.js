const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const readline = require('readline');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Mesajları saklamak için bir dizi oluşturun
let messages = [];
let usernames = new Set();  // Kullanıcı adlarını takip etmek için bir set

// Admin kullanıcı adı
let admin = "";

// Terminalden admin kullanıcı adını alın
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Admin kullanıcı adını girin: ', (answer) => {
    admin = answer;
    console.log('Admin kullanıcı adı:', admin);

    // Public klasörünü statik dosyalar için ayarlayın
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    io.on('connection', (socket) => {
        console.log('a user connected');

        socket.on('set username', (username) => {
            if (usernames.has(username)) {
                socket.emit('username exists');
            } else {
                usernames.add(username);
                socket.username = username;

                // Yeni bağlanan kullanıcıya mevcut mesajları gönder
                messages.forEach((message) => {
                    socket.emit('chat message', message);
                });
            }
        });

        socket.on('disconnect', () => {
            if (socket.username) {
                usernames.delete(socket.username);
            }
            console.log('user disconnected');
        });

        socket.on('chat message', (data) => {
            // Admin kullanıcı adını kontrol et ve "cls" komutunu çalıştır
            if (data.username === admin && data.message === 'cls') {
                // Mesajları temizle
                messages = [];
                // Tüm istemcilere sohbeti temizle sinyali gönder
                io.emit('clear chat');
            } else {
                // Mesajı sakla
                messages.push({ username: data.username, message: data.message });

                // Tüm kullanıcılara mesajı gönder
                io.emit('chat message', { username: data.username, message: data.message });
            }
        });
    });

    server.listen(33213, () => {
        console.log('listening on *:33213');
    });

    rl.close(); // readline arayüzünü kapat
});