import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server)

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        //console.log('message: ' + msg);
        io.emit('chat message', msg)
    });
});

server.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
})