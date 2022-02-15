import {createServer} from "http"
import {Server} from "socket.io"

import "dotenv/config"

interface Dict {
    [key:string]: string
}

interface ListenEvent {
    greetings: (greetings: string, from: string, ack: (response: string) => void) => void
    //storePubKey: (pubKeyInfo: Dict) => void // e.g., ["Alice"] = "..."
    //requestPubKey: (who:string, ack: (pubKey: string) => void) => void

    clientMessage: (to: string, message: string) => void

    DFKeyExchangeSyn: (from: string, to: string, primeNumber: number, generator: number) => void
    DFKeyExchangeAck: (to: string, publicKey: number) => void
}

interface EmitEvent {
    serverMessage: (to:string, message:string) => void
    
    DFKeyExchangeSyn: (from: string, to: string, primeNumber: number, generator: number) => void
    DFKeyExchangeAck: (to: string, publicKey: number) => void
}

const httpServer = createServer()
const io = new Server<ListenEvent, EmitEvent>(httpServer)
let userAddress: Dict = {}

const SERVER_TYPE = "http"
const SERVER_ADDRESS = process.env.SERVER_IP
const SERVER_PORT = process.env.SERVER_PORT

httpServer.listen(Number(SERVER_PORT), SERVER_ADDRESS, () => {
    console.log(`Listening on ${SERVER_ADDRESS}:${SERVER_PORT}`)
})

io.on("connection", (socket) => {
    socket.on("greetings", (greetings:string, from:string, ack) => {
        let clientAddress:string = socket.handshake.address
        console.log(greetings)
        console.log("Client address: ", clientAddress)
        userAddress[from] = socket.id
        console.log(userAddress)
        ack(`You are connected to ${SERVER_TYPE}://${SERVER_ADDRESS}:${SERVER_PORT}`)
    })

    socket.on("DFKeyExchangeSyn", (from: string, to: string, primeNumber: number, generator: number) => {
        console.log(`${from} send syn to ${to}`)
        socket.to(userAddress[to]).emit("DFKeyExchangeSyn", from, to, primeNumber, generator)        
    })

    socket.on("DFKeyExchangeAck", (to: string, publicKey: number) => {
        console.log(`Send ack to ${to}`)
        socket.to(userAddress[to]).emit("DFKeyExchangeAck", to, publicKey)
    })

    socket.on("clientMessage", (to: string, message: string) => {
        socket.to(userAddress[to]).emit("serverMessage", to, message)
    })
})


