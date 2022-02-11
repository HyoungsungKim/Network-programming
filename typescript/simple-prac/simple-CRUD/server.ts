import {createServer} from "http"
import { Server } from "socket.io";
import {SimpleDB, Message, Dict} from "./simpleDB"

import "dotenv/config"

interface Response {
    status: Dict
    READResponse? : Dict|undefined
}

interface ListenEvent {
    greetings: (greetings:string) => void
    CREATE: (message:Message, ack: (response:Response) => void) => void
    READ: (message:Message, ack: (response:Response) => void) => void
    UPDATE: (message:Message, ack: (response:Response) => void) => void
    DELETE: (message:Message, ack: (response:Response) => void) => void
}

interface EmitEvent {
    greetings: (greeting: string) => void
    //READResponse: (response:Dict|string) => void
}

const httpServer = createServer()
const io = new Server<ListenEvent, EmitEvent>(httpServer)
const simpleDB = new SimpleDB()

const serverType = "http"
const serverPort = process.env.SERVER_PORT
const serverAddress = process.env.SERVER_IP

httpServer.listen(Number(serverPort), serverAddress, () => {
    console.log(`Listening on ${serverAddress}:${serverPort}`)
})

io.on("connection", (socket) => {
    //ServerToClientEvents => emit
    socket.emit("greetings", `You are connected to ${serverType}://${serverAddress}:${serverPort}`)

    //ClientTpServerEvents => on
    socket.on("greetings", (greetings:string) => {
        let clientAddress:string = socket.handshake.address
        console.log(greetings)
        console.log("Client address: ", clientAddress)
    })

    socket.on("CREATE", (message:Message, ack) => {        
        let responseData:Response = {
            status:  simpleDB.executor(message) ?? <Dict>{result: "Done"}
        }
        console.log(responseData, simpleDB.simpleDB)
        ack(responseData)
    })

    socket.on("READ", (message:Message, ack) => {
        let READResult = simpleDB.executor(message)
        let responseData:Response = {status: <Dict>{}}
        // If READResult is undefined
        if (!READResult) {
            responseData.status["result"] = "Fail"
        } else {
            responseData.status["result"] = "Done"
            responseData.READResponse = READResult
        }
        
        console.log(responseData, simpleDB.simpleDB)
        ack(responseData)
    })

    socket.on("UPDATE", (message:Message, ack) => {
        let responseData:Response = {
            status:  simpleDB.executor(message) ?? <Dict>{result: "Done"}
        }
        console.log(responseData, simpleDB.simpleDB)
        ack(responseData)
    })

    socket.on("DELETE", (message:Message, ack) => {
        let responseData:Response = {
            status:  simpleDB.executor(message) ?? <Dict>{result: "Done"}
        }
        console.log(responseData, simpleDB.simpleDB)
        ack(responseData)
    })
})