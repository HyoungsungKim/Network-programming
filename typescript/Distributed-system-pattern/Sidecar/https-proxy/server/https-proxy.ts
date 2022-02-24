import { createServer } from "https";
import { Server } from "socket.io";
import {io, Socket} from "socket.io-client"
import { readFileSync } from "fs";

interface ListenEvents {
    greetings: (greetings:string, ack:(response:string) => void) => void
}

interface EmitEvents {
    greetings: (greetings:string, ack:(response: string) => void) => void
}

const httpsServer = createServer({
    key: readFileSync("./keystore/private.pem"),
    cert: readFileSync("./keystore/public.pem")
})

const PROXY_SERVER_TYPE = "https"
const PROXY_SERVER_PORT = isNaN(Number(process.env.PROXY_SERVER_PORT)) ? 3000 : Number(process.env.PROXY_SERVER_PORT)
const PROXY_SERVER_ADDRESS = process.env.PROXY_SERVER_ADDRESS ?? "127.0.0.1"

const SERVER_TYPE = "http"
const SERVER_PORT = isNaN(Number(process.env.SERVER_PORT)) ? 3010 : Number(process.env.SERVER_PORT)
const SERVER_ADDRESS = process.env.SERVER_ADDRESS  ?? "127.0.0.1"

const proxyIO = new Server<ListenEvents, EmitEvents>(httpsServer)
const proxySocket:Socket<ListenEvents, EmitEvents> = io(`${SERVER_TYPE}://${SERVER_ADDRESS}:${SERVER_PORT}`)

httpsServer.listen(PROXY_SERVER_PORT, PROXY_SERVER_ADDRESS, () => {
    console.log(`Listening on ${PROXY_SERVER_TYPE}://${PROXY_SERVER_ADDRESS}:${PROXY_SERVER_PORT}`)
})

proxySocket.on("connect", () => {
    proxySocket.emit("greetings", "Proxy server is connected", (response: string) => {
        console.log("Proxy server is connected to http server")
        console.log("http server: ", response)
    })
})

proxyIO.on("connection", (socket) => {
    socket.on("greetings", (greetings:string, ack) =>{
        console.log("Proxy server is connected to client")
        console.log("Client message: ", greetings)
        ack("You are connected to proxy server")
    })
})