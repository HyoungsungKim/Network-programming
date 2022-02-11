import { io, Socket} from "socket.io-client"
import * as readline from "readline"
import { Message, Dict } from "./simpleDB"
import "dotenv/config"

interface Response {
    status: Dict
    READResponse? : Dict|undefined
}

interface ListenEvents {
    greetings: (greeting: string, serverAddr: string) => void
    READResponse: (response: Dict|string) => void
}

interface EmitEvents {
    greetings: (greetings:string) => void
    CREATE: (message:Message, ack: (response:Response) => void) => void
    READ: (message:Message, ack: (response:Response) => void) => void
    UPDATE: (message:Message, ack: (response:Response) => void) => void
    DELETE: (message:Message, ack: (response:Response) => void) => void
}

const serverType = "http"
const serverPort = process.env.SERVER_PORT
const serverAddress = process.env.SERVER_IP

const socket:Socket<ListenEvents, EmitEvents> = io(`${serverType}://${serverAddress}:${serverPort}`)

socket.on("connect", () => {
    socket.emit("greetings", "Hello from client")
})

socket.on("greetings", (emitMessage:string) => {
    console.log(emitMessage)
})

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let waitingConnect = true
let i = 0

async function main() {
    let message:Message = {
        header: "",
        key: "",
    }

    if (waitingConnect) {
        waitingConnect = false
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const headerQuestion = async (message:Message): Promise<Message> => {
        return new Promise((resolve, reject) => {
            rl.question("Header (CREATE | READ | UPDATE | DELETE): ", (answer) => {
                message.header = answer
                resolve(message)                
            })
        })
    }

    const optionsQuestion = (message:Message): Promise<Message> => {
        if (message.header == "READ") {
            return new Promise((resolve, reject) => {
                rl.question("Read all? (true | false) ", (answer) => {
                    message.options = {"readAll": (answer == "true")}
                    resolve(message)
                })
            })
        } else {
            return new Promise((resolve, reject) => {
                resolve(message)
            })
        }
    }

    const keyQuestion = (message:Message): Promise<Message> => {
        if (message.options?.readAll == true) {
            return new Promise((resolve, reject) => {
                resolve(message)
            })
        } else {
            return new Promise((resolve, reject) => {
                rl.question("Key? ", (answer) => {
                    message.key = answer
                    resolve(message)
                })
            })
        }
    }

    const valueQuestion = (message:Message): Promise<Message> => {
        if (message.header == "READ" || message.header == "DELETE") {
            return new Promise((resolve, reject) => {
                resolve(message)
            })    
        } else {
            return new Promise((resolve, reject) => {
                rl.question("value? ", (answer) => {
                    message.value = answer
                    resolve(message)
                })
            })
        }
    }

    const emitter = (message:Message): Promise<void> => {
        return new Promise((resolve, reject) => {
            console.log("Message : ", message)            
            socket.emit(message.header as "CREATE" | "READ" | "UPDATE" | "DELETE", message, (response) => {
                console.log(response.status)

                if (response.READResponse) {
                    console.log(response.READResponse)
                }
                resolve()
            })
        })
    }

    /*
    const result = (message:Message) =>  {
        if (message.header == "READ") {
            socket.on("READResponse", (response) => {
                if (response) {
                    i++       
                    console.log(i, response)
                }
            })
        }
    }
    */

    await headerQuestion(message)
            .then(optionsQuestion)
            .then(keyQuestion)
            .then(valueQuestion)
            .then(emitter)
            //.then(console.log)
            //.then(result)
            .then(main)

    //main()
}

try {
    main()
} catch(e) {
    console.log((e as Error).message)
}

