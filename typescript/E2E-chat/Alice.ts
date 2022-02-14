import { io, Socket } from "socket.io-client"
import {DFKeyExchange, AESencryption, AESdecryption} from "./encryption"
import * as readline from "readline"

import "dotenv/config"

interface Dict {
    [key: string]: string
}

interface ListenEvents {
    serverMessage: (who:string, message:string) => void
    
    DFKeyExchangeAck: (response: number) => void
}

interface EmitEvents {
    greetings: (greetings: string, ack: (response: string) => void) => void
    storePubKey: (pubkeyInfo: Dict) => void
    requestPubKey: (who: string, ack: (pubkey: string) => void) => void

    clientMessage: (who: string, message: string) => void
    DFKeyExchangeSyn: (to: string, primeNumber: number, generator: number) => void

}

const SERVER_TYPE = "http"
const SERVER_ADDRESS = process.env.SERVER_IP
const SERVER_PORT = process.env.SERVER_POST

const socket:Socket<ListenEvents, EmitEvents> = io(`${SERVER_TYPE}://${SERVER_ADDRESS}:${SERVER_PORT}`)

const alice = new DFKeyExchange()

socket.on("connect", () => {
    socket.emit("greetings", "Hello from client", (ackResponse: string) => {
        console.log("From server, ", ackResponse)
    })

    socket.emit("DFKeyExchangeSyn", "Bob", alice.primeNumber, alice.generator)
})