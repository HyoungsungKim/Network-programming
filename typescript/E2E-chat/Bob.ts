import { io, Socket } from "socket.io-client"
import {DFKeyExchange, AESencryption, AESdecryption} from "./encryption"
import * as readline from "readline"

import "dotenv/config"

interface Dict {
    [key: string]: any
}

interface ListenEvents {
    serverMessage: (to:string, message:string) => void
    
    DFKeyExchangeSyn: (from: string, to: string, primeNumber: number, generator: number) => void
    DFKeyExchangeAck: (to: string, publicKey: number) => void
}

interface EmitEvents {
    greetings: (greetings: string, from:string, ack: (response: string) => void) => void
    storePubKey: (pubkeyInfo: Dict) => void
    //requestPubKey: (who: string, ack: (pubkey: string) => void) => void

    clientMessage: (to: string, message: string) => void
    DFKeyExchangeSyn: (from:string, to: string, primeNumber: number, generator: number) => void
    DFKeyExchangeAck: (to: string, publicKey: number) => void
}

const SERVER_TYPE = "http"
const SERVER_ADDRESS = process.env.SERVER_IP
const SERVER_PORT = process.env.SERVER_PORT

const socket:Socket<ListenEvents, EmitEvents> = io(`${SERVER_TYPE}://${SERVER_ADDRESS}:${SERVER_PORT}`)

let bob: DFKeyExchange

let waitingConnect = true
let sender: string = "Alice"
let receiver: string = "Bob"
let receiverPubkey: Dict

socket.on("connect", () => {
    socket.emit("greetings", "Hello from Bob", "Bob", (ackResponse: string) => {
        console.log("From server, ", ackResponse)
    })
})

// When Bob send ack to Alice, Alice send back Alice's public key to Bob
socket.on("DFKeyExchangeAck", (to: string, publicKey: number) => {
    receiverPubkey[to] = publicKey
})

// It is only used when Bob send initial syn
// When Bob send syn to Alice, Alice send back ack to Bob
socket.on("DFKeyExchangeSyn", (from: string, to: string, primeNumber: number, generator: number) => {
    console.log(`${to} received syn from ${from}`)

    if (!bob) {
        bob = new DFKeyExchange(undefined, undefined, primeNumber=primeNumber, generator=generator)
    }
    socket.emit("DFKeyExchangeAck", from, bob.publicKey)
    console.log(`${to} send back ack to ${from}`)
})

socket.on("serverMessage", (_, message: string) => {
    console.log(`${sender}: ${message}`)
})

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

async function main() {
    if (waitingConnect) {
        waitingConnect = false
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    /*
    const initHandshake = () => {
       socket.emit("DFKeyExchangeSyn", sender, receiver, bob.primeNumber, bob.generator)
    }
    initHandshake()
    */
    console.log("Request to generate secret key")
    // Wait until generating secret key
    /*
    while (!(bob.getSecretKey())) {
        initHandshake()
    }
    */
    //console.log("Secret key is generated")

    const sendMessage = () => {
        rl.question(`${sender}: `, (message: string) => {
            socket.emit("clientMessage", receiver, message)
        })

        sendMessage()
    }

}

main()