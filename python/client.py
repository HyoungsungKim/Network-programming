import socket

s = socket.socket()
host = socket.gethostname()
port = 12345

s.connect(("10.252.107.31", port))
print(s.recv(1024))
s.close()