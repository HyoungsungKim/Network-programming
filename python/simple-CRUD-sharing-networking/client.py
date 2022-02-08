import socket
import os
import json

from dotenv import load_dotenv

load_dotenv();
VALID_HEADER = {"CREATE", "READ", "UPDATE", "DELETE"}

class Client:
    SERVER_IP = None
    SERVER_PORT = None
    
    def __init__(self, server_ip=os.environ.get('SERVER_IP'), server_port=int(os.environ.get('SERVER_PORT'))):
        self.SERVER_IP = server_ip
        self.SERVER_PORT = server_port
        
    def _generate_socket(self):
        return socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        
    def _create(self):
            key = input("key: ")
            value = input("value: ")
            
            return {key:value}, None
            
    def _read(self):
            READ_ALL = input("READ ALL?(True, False): ")
            READ_ALL = (READ_ALL == "True")
            if READ_ALL:
                key = "None"
            else:
                key = input("key: ")
                
            return {key:None}, {"options":{"READ_ALL":READ_ALL}}
                
    def _update(self):
        key = input("key: ")
        value = input("value: ")
        
        return {key:value}, None
        
    def _delete(self):
        key = input("key: ")
        
        return {key:None}, None
    
    def _CRUD_packing(self):        
        HEADER = input("HEADER?(CREATE, READ, UPDATE, DELETE): ")
        
        if HEADER not in VALID_HEADER:
            "Wrong header"
            return 
        
        functions = {
            "CREATE": self._create,
            "READ": self._read,
            "UPDATE": self._update,
            "DELETE": self._delete,
        }
        
        func = functions[HEADER]
        data, options = func()
        
        packing = {
            "header": HEADER,
            "data": data,
            "options":options            
        }
        
        return packing
        
    def connect(self):
        with self._generate_socket() as soc:
            soc.connect((self.SERVER_IP, self.SERVER_PORT))            
            while True:
                try:
                    recv_message = soc.recv(1024)
                    print(recv_message.decode())
                    
                    packing = self._CRUD_packing()
                    json_packing = json.dumps(packing, indent=4)
                    print("Packed data: \n", json_packing)
                    soc.send(json_packing.encode())
                except Exception as e:
                    print(e)
                    soc.close()
                    break
            
if __name__ == "__main__":
    client = Client()
    client.connect()