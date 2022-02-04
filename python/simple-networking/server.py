import socket
import os
from dotenv import load_dotenv

load_dotenv()
SERVER_IP = os.environ.get('SERVER_IP')
SERVER_PORT = int(os.environ.get('SERVER_PORT'))

with socket.socket() as soc:
    soc.bind((SERVER_IP, SERVER_PORT))
    soc.listen(5)
    conn, addr = soc.accept()
    with conn:
        print("Connected by", addr)
        while True:
            data = conn.recv(1024)
            if not data:
                break
            print("Received", repr(data))            
            conn.send(data)