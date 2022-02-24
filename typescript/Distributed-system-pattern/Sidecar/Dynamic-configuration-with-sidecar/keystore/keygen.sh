#!/bin/bash

# chmod +x keygen.sh

rm private.pem
rm public.pem

openssl genrsa 1024 > private.pem
openssl req -x509 -new -key private.pem > public.pem

# cp private.pem ../sharedFileSystem/keystore/private.pem
# cp public.pem ../sharedFileSystem/keystore/public.pem