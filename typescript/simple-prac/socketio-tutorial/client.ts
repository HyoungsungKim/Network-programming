import { io, Socket } from "socket.io-client";
import "dotenv/config"

const serverType = "http"
const serverAddress = process.env.SERVER_IP
const serverPort = process.env.SERVER_PORT

const socket:Socket = io(`${serverType}://${serverAddress}:${serverPort}`);

socket.on("connect", () => {
    socket.send("Hello server from client")

    socket.emit("greetings", "Hey!", {"mr":"jone"}, Buffer.from([1, 2, 3, 4]))
})

socket.on("message", data => {
    console.log(data)
})

socket.on("greetings", (elem1, elem2, elem3) => {
    console.log(elem1, elem2, elem3)
})