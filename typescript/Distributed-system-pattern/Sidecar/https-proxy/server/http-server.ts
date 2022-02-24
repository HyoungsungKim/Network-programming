import { createServer } from "http";
import { Server } from "socket.io";

interface ListenEvents {
    greetings: (greetings:string, ack: (response: string) => void) => void
}

interface EmitEvents {
    
}



const SERVER_TYPE = "http"
const SERVER_PORT = isNaN(Number(process.env.SERVER_PORT)) ? 3010 : Number(process.env.SERVER_PORT)
const SERVER_ADDRESS = process.env.SERVER_ADDRESS ?? "127.0.0.1"

const httpServer = createServer()
const io = new Server<ListenEvents, EmitEvents>(httpServer)

httpServer.listen(SERVER_PORT, SERVER_ADDRESS, () => {
    console.log(`Listening on ${SERVER_TYPE}://${SERVER_ADDRESS}:${SERVER_PORT}`)
})

io.on("connection", (socket) => {
    socket.on("greetings", (greetings: string, ack) => {
        console.log("proxy server: ", greetings)
        ack("You are connected to http server")
    })
})