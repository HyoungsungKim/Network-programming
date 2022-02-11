import { createServer } from "http"
import { Server } from "socket.io";
import "dotenv/config"

interface ServerToClientEvents {
    greetings: (greeting: string, to:Record<string, string>, buff:Buffer) => void
}

const httpServer = createServer()
const io = new Server(httpServer)

const serverAddress = process.env.SERVER_IP
const serverPort = process.env.SERVER_PORT

httpServer.listen(Number(serverPort), serverAddress, () => {
    console.log("Listening on 10.252.107.31:3000")
})

io.on("connection", (socket) => {
    socket.send("Hello! client from server")
    socket.emit("greetings", "Hey!", {"ms": "jane"}, Buffer.from([4, 3, 3, 1]));

    socket.on("message", (data) => {
        console.log(data)
    })

    socket.on("greetings", (elem1, elem2, elem3) => {
        console.log(elem1, elem2, elem3)
    })
})

//console.log("Listening on ws://localhost:3000")
