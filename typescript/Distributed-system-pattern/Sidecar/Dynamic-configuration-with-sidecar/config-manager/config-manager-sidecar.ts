import {io, Socket } from "socket.io-client";
import { getChecksum, updateConfig } from "./utils";

interface ListenEvents {

}

interface EmitEvents {
    greetings: (greetings: string) => void
    updateConfig: (ack: (response:string) => void) => void
}

const SERVER_TYPE = "http"
const SERVER_PORT = isNaN(Number(process.env.SERVER_PORT)) ? 3010 : Number(process.env.SERVER_PORT)
const SERVER_ADDRESS = process.env.SERVER_ADDRESS ?? "127.0.0.1"


const socket:Socket<ListenEvents, EmitEvents> = io(`${SERVER_TYPE}://${SERVER_ADDRESS}:${SERVER_PORT}`)

const privateKeyPath = "./keystore/private.pem"
const publicKeyPath = "./keystore/public.pem"

const sharedFSPrivateKeyPath = "./sharedFileSystem/keystore/private.pem"
const sharedFSPublicKeyPath = "./sharedFileSystem/keystore/public.pem"

let privateKeyChecksum = getChecksum(privateKeyPath)
let publicKeyChecksum = getChecksum(publicKeyPath)

function checkConfigChange(interval:number) {
    setInterval(() => {
        console.log("Checking changed config...")
        let checkPrivateKey = getChecksum(privateKeyPath) === privateKeyChecksum
        let checkPublicKey = getChecksum(publicKeyPath) === publicKeyChecksum

        if (!(checkPrivateKey && checkPublicKey)) {
            updateConfig(privateKeyPath, sharedFSPrivateKeyPath)
            updateConfig(publicKeyPath, sharedFSPublicKeyPath)
            console.log("Keystore is updated")

            privateKeyChecksum = getChecksum(privateKeyPath)
            publicKeyChecksum = getChecksum(publicKeyPath)

            console.log(privateKeyChecksum)
            console.log(publicKeyChecksum)

            socket.emit("updateConfig", (response:string) => {
                console.log(response)
            })
        }        

    }, interval)
}

socket.on("connect", () => {
    socket.emit("greetings", "You are connected to client")
    checkConfigChange(10000)
})