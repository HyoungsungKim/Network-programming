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

let alice: DFKeyExchange = new DFKeyExchange()

let sender: string = "Alice"
let receiver: string = "Bob"

socket.on("connect", () => {
    socket.emit("greetings", "Hello from Alice", sender, (ackResponse: string) => {
        console.log("From server, ", ackResponse)
    })
})

// When Alice gets ack from Bob, Alice send back ack to Bob with public Key
socket.on("DFKeyExchangeAck", (_, publicKey: number) => {
    console.log("Succeeded in handshake")
    alice.generateSecretKey(publicKey)
    console.log("Secret key: ", alice.getSecretKey())
    socket.emit("DFKeyExchangeAck", receiver, alice.publicKey)
})

// It is only used when Bob send initial syn
// When Bob send syn to Alice, Alice send back ack to Bob
socket.on("DFKeyExchangeSyn", (from: string, _, primeNumber: number, generator: number) => {
    if (!alice) {
        alice = new DFKeyExchange(primeNumber=primeNumber, generator=generator)
    }
    socket.emit("DFKeyExchangeAck", from, alice.publicKey)
})

socket.on("serverMessage", (to: string, message: string) => {
    message = AESdecryption(message, alice.getSecretKey()!.toString()).toString(cryptojs.enc.Utf8)
    console.log(`${receiver} sent message to ${to}: ${message}`)
})

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

async function main() {   
    const delay = () => new Promise(resolve => setTimeout(resolve, 1000))

    // Wait connection
    await delay()

    // Wait ack until generating secret key
    const initHandshake = async (): Promise<void> => {
        return new Promise((resolve, reject) => {
            rl.question(`Ready to handshake[y/n]?`, (message:string) => {
                if (message === 'y') {
                    console.log("Start handshake")
                    socket.emit("DFKeyExchangeSyn", sender, receiver, alice.primeNumber!, alice.generator!)
                }
                resolve()
            })
       })
    }

    const sendMessage = async (): Promise<void> => {
        return new Promise((resolve, reject) => {
            rl.question(`${sender}: `, (message: string) => {
                let encryptedMessage = AESencryption(message, alice.getSecretKey()!.toString()).toString()
                socket.emit("clientMessage", receiver, encryptedMessage)
                resolve()
            })
        })        
    }

    const continuousChat = async () => {
        await sendMessage()
        continuousChat()
    }

    await initHandshake()
            .then(delay)    // Wait handshake
            .then(continuousChat)
}

main()

