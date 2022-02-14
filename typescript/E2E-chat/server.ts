import {createServer} from "http"
import {Server} from "socket.io"

import "dotenv/config"

interface Dict {
    [key:string]: string
}

interface ListenEvent {
    greetings: (greetings: string, ack: (response: string) => void) => void
    storePubKey: (pubKeyInfo: Dict) => void // e.g., ["Alice"] = "..."
    requestPubKey: (who:string, ack: (pubKey: string) => void) => void

    clientMessage: (who: string, message: string) => void
    DFKeyExchangeSyn: (to: string, primeNumber: number, generator: number) => void
}

interface EmitEvent {
    serverMessage: (who:string, message:string) => void
    
    DFKeyExchangeSyn: (to: string, primeNumber: number, generator: number) => void
}

const httpServer = createServer()
const io = new Server<ListenEvent, EmitEvent>(httpServer)
let userAddress: Dict = {}
let keyStore: Dict = {}

const SERVER_TYPE = "http"
const SERVER_ADDRESS = process.env.SERVER_IP
const SERVER_PORT = process.env.SERVER_PORT

httpServer.listen(Number(SERVER_PORT), SERVER_ADDRESS, () => {
    console.log(`Listening on ${SERVER_ADDRESS}:${SERVER_PORT}`)
})

io.on("connection", (socket) => {
    //socket.emit("greetings", `You are connected to ${SERVER_TYPE}://${SERVER_ADDRESS}:${SERVER_PORT}`)

    socket.on("greetings", (greetings:string, ack) => {
        let clientAddress:string = socket.handshake.address
        console.log(greetings)
        console.log("Client address: ", clientAddress)
        ack(`You are connected to ${SERVER_TYPE}://${SERVER_ADDRESS}:${SERVER_PORT}`)
    })


})


