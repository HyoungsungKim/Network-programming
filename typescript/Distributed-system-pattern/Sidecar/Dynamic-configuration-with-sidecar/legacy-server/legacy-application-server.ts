import {Server} from "socket.io"
import {createServer} from "http"
import { getChecksum } from "./utils";

interface ListenEvents {
    greetings: (greetings: string) => void
    updateConfig: (ack: (response:string) => void) => void
}

interface EmitEvents {

}

const SERVER_TYPE = "http"
const SERVER_PORT = isNaN(Number(process.env.SERVER_PORT)) ? 3010 : Number(process.env.SERVER_PORT)
const SERVER_ADDRESS = process.env.SERVER_ADDRESS ?? "127.0.0.1"


const httpServer = createServer()
const io = new Server<ListenEvents, EmitEvents>(httpServer)

const sharedFSPrivateKeyPath = "./sharedFileSystem/keystore/private.pem"
const sharedFSPublicKeyPath = "./sharedFileSystem/keystore/public.pem"

httpServer.listen(Number(SERVER_PORT), SERVER_ADDRESS, () => {
    console.log(`Listening on ${SERVER_TYPE}://${SERVER_ADDRESS}:${SERVER_PORT}`)
})

io.on("connection", (socket) => {
    socket.on("greetings", (greetings: string) => {
        console.log("Client: ", greetings)
    })

    socket.on("updateConfig", (ack) => {
        console.log(getChecksum(sharedFSPrivateKeyPath))
        console.log(getChecksum(sharedFSPublicKeyPath))
        ack("Updated keystore is checked")
    })
})