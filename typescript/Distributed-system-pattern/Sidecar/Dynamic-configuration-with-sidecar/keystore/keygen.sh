#!/bin/bash

# chmod +x keygen.sh

rm private.pem
rm public.pem

openssl genrsa 1024 > private.pem
openssl req -x509 -new -key private.pem > public.pem
