interface Dict {
    [key: string]: any
}

interface CRUDExecutor {
    [key:string]: any
}

interface Message {
    header: string, 
    key: string,
    value?: any|undefined,
    options?: Dict|undefined
}

class SimpleDB {
    simpleDB: Dict = {}

    constructor(){}

    private create(key: string, value: any, options?: Dict|undefined) {
        this.simpleDB[key] = value
    }

    private read(key: string, value?: any|undefined, options?: Dict|undefined): Dict|any {        
        let readOptions = options ?? <Dict>{}
        if (readOptions["readAll"] === true) {
            return this.simpleDB
        }
        else {
            let simpleDBSubset:Dict = {}
            simpleDBSubset[key] = this.simpleDB[key]
            return simpleDBSubset
        }
    }

    private update(key: string, value: any, options?: Dict|undefined) {
        if (key in this.simpleDB) {
            this.create(key, value)
        }
    }

    private delete(key: string, value?: any|undefined, options?: Dict|undefined) {
        if (key in this.simpleDB) {
            delete this.simpleDB[key]
        }
    }

    public executor(msg: Message) {   
        try {            
            /*
            let CRUDSelector: CRUDExecutor = {
                "CREATE": () => { this.create },
                "READ": () => { this.read },
                "UPDATE": () => { this.update },
                "DELETE": () => { this.delete },
            }
            */
            let CRUDSelector: CRUDExecutor = {
                "CREATE": (this.create).bind(this),
                "READ": (this.read).bind(this),
                "UPDATE": (this.update).bind(this),
                "DELETE": (this.delete).bind(this),
            }

            let CRUDFunc = CRUDSelector[msg.header]
            let result = CRUDFunc(msg.key, msg.value, msg.options)
            return result
            

        } catch(error) {
            console.error((error as Error).message)            
            return undefined
        }
    }
}

function testCRUD() {
    let simpleDB = new SimpleDB()
    function testCREATE() {
        console.log("test CREATE function")

        let msg1: Message = {
            header: "CREATE",
            key: "Hello",
            value: "world",
        }

        let msg2: Message = {
            header: "CREATE",
            key: "CRUD",
            value: "test",
        }

        simpleDB.executor(msg1)
        simpleDB.executor(msg2)

        console.log("SimpleDB is ", simpleDB.simpleDB, '\n')
    }

    function testREAD() {
        console.log("test READ function")
        let msg1: Message = {
            header: "READ",
            key: "Hello",            
        }

        let msg2: Message = {
            header: "READ",
            key: "Hello",            
            options: {"readAll":true}
        }

        console.log(`Read ${msg1.key} is`, simpleDB.executor(msg1))
        console.log(`Read all DB is`, simpleDB.executor(msg2), '\n')
    }

    function testUPDATE() {
        console.log("test UPDATE function")
        let msg1: Message = {
            header: "UPDATE",
            key: "Hello",
            value: "new world",
        }
        simpleDB.executor(msg1)
        console.log("SimpleDB is ", simpleDB.simpleDB, '\n')
    }

    function testDELETE() {
        console.log("test DELETE function")
        let msg1: Message = {
            header: "DELETE",
            key: "CRUD",
        }
        simpleDB.executor(msg1)
        console.log("SimpleDB is ", simpleDB.simpleDB, '\n')
    }

    testCREATE()
    testREAD()
    testUPDATE()
    testDELETE()
}

testCRUD()