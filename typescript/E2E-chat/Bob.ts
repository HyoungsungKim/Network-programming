import { io, Socket } from "socket.io-client"
import * as cryptojs from "crypto-js"
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

socket.on("connect", () => {
    socket.emit("greetings", "Hello from Bob", receiver, (ackResponse: string) => {
        console.log("From server, ", ackResponse)
    })
})

// When Bob send ack to Alice, Alice send back Alice's public key to Bob
socket.on("DFKeyExchangeAck", (_, publicKey: number) => {
    bob.generateSecretKey(publicKey)    
    console.log("Secret key: ", bob.getSecretKey())
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

socket.on("serverMessage", (to: string, message: string) => {
    message = AESdecryption(message, bob.getSecretKey()!.toString()).toString(cryptojs.enc.Utf8)
    console.log(`${sender} send message to ${to}: ${message}`)
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

    console.log("Request to generate secret key")

    const sendMessage = async (): Promise<void> => {
        return new Promise((resolve, reject) => {
            rl.question(`${receiver}: `, (message: string) => {
                let encryptedMessage = AESencryption(message, bob.getSecretKey()!.toString()).toString()
                socket.emit("clientMessage", sender, encryptedMessage)
                resolve()
            })
        })        
    }

    const continuousChat = async () => {
        await sendMessage()
        continuousChat()
    }

    await continuousChat()
}

main()