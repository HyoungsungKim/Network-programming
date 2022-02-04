import socket
import os
from dotenv import load_dotenv

load_dotenv()
SERVER_IP = os.environ.get('SERVER_IP')
SERVER_PORT = int(os.environ.get('PORT'))

with socket.socket() as soc:
    soc.connect((SERVER_IP, SERVER_PORT))
    soc.send(b'Hello, world')
    data = soc.recv(1024)

print("Received", repr(data))