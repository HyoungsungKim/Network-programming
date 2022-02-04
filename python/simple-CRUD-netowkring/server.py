import socket
import os
import json
from dotenv import load_dotenv

load_dotenv()

VALID_HEADER = {"CREATE", "READ", "UPDATE", "DELETE"}

class Server:
    SERVER_IP = None
    SERVER_PORT = None
    
    simple_DB = {}
    
    def __init__(self, server_ip=os.environ.get('SERVER_IP'), server_port=int(os.environ.get('SERVER_PORT'))):
        self.SERVER_IP = server_ip
        self.SERVER_PORT = server_port
        
    def _generate_socket(self):        
        # "AF_INET" is IPv4
        # "SOCK_STREAM" is TCP connection
        return socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    def _create(self, key, value, options=None):
        print("Creating...")
        self.simple_DB[key] = value
        
    def _read(self, key, value=None, options=None):
        print("Reading...")
        if options.get("READ_ALL", True):
            return self.simple_DB
        else:
            return self.simple_DB[key]
    
    def _update(self, key, value, options=None):
        print("Updating...")
        if key in self.simple_DB:
            self._create(key, value)

    def _delete(self, key, value=None, options=None):
        print("Deleting...")
        if key in self.simple_DB:
            del self.simple_DB[key]
                
    def CRUD_executor(self, json_data):
        '''
        json example #1
        {
            "header": "CREATE",
            "data":{key: value}
        }        
        
        json example #2
        {
            "header": "READ",
            "data":{key:value},
            "options": {"READ_ALL":True}
        }
        '''
        header = json_data["header"]
        data = json_data["data"]
        key = list(data.keys())[0]
        value = data.get(key, None)
        options = json_data.get("options")
        
        CRUD_functions = {
            "CREATE": self._create,
            "READ": self._read,
            "UPDATE": self._update,
            "DELETE": self._delete
        }
        
        CRUD_func = CRUD_functions[header]             
        return CRUD_func(key, value, options)
        
    def connect(self):
        with self._generate_socket() as soc:
            soc.bind((self.SERVER_IP, self.SERVER_PORT))
            soc.listen()
            conn, addr = soc.accept()
            with conn:
                print("Connected to", addr)
                conn.send(b"You are connected to the server")
                while True:
                    try:
                        data = conn.recv(1024)
                        #print("Received data", data)
                        json_data = json.loads(data.decode())
                        print("Received json", json_data)
                        result = self.CRUD_executor(json_data)
                        if result is None:
                            conn.send(b"Done!")
                            print("Done! Current DB data is ", self.simple_DB)                            
                        else:
                            conn.send(json.dumps(result, indent=4).encode())
                            conn.send(b"Done!")
                            print("Done! Current DB data is ", self.simple_DB)                            
                            
                    except Exception as e:
                        print(e)
                        # To close easily
                        conn.close()
                        soc.close()
                        break
                    
if __name__ == "__main__":
    server = Server()
    server.connect()                 
    
    