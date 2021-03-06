import * as crypto from 'crypto';
import * as cryptojs from "crypto-js";

// Simple Diffie-Hellman key exchange
// https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange
export class DFKeyExchange {
    publicKey: number
    public primeNumber?: number|undefined
    public generator?: number|undefined

    private primeBitLength?: number|undefined
    private privateKey?: number|undefined
    private secretKey: number|undefined = undefined

    constructor(
        primeBitLength?: number,
        privateKey?: number,
        primeNumber?: number,
        generator?: number
        ) {
        this.primeBitLength = primeBitLength ?? 7;
        this.primeNumber = primeNumber ?? Number(crypto.generatePrimeSync(this.primeBitLength, {bigint:true}));
        this.generator = generator ?? crypto.randomInt(1, this.primeNumber-1)

        this.privateKey = this.initPrivateKey(privateKey)
        this.publicKey = this.generatePublicKey()
    }

    private initPrivateKey(privateKey?: number|undefined): number {
        return this.privateKey = privateKey ?? crypto.randomInt(1, 2**this.primeBitLength!)
    }

    private generatePublicKey(): number {        
        return this.publicKey = modular(this.generator!, this.privateKey!, this.primeNumber!)
    }

    generateSecretKey(receivedPublicKey: number) {
        //this.secretKey = receivedPublicKey**this.privateKey! % this.primeNumber!
        this.secretKey = modular(receivedPublicKey, this.privateKey!, this.primeNumber!)
    }

    getSecretKey() {
        return this.secretKey
    }
}

function modular(base: number, exp: number, numerator: number): number {
    let init: number = 1
    for (let i = 0; i < exp; i++) {
        init = ((init % numerator) * (base % numerator) % numerator)
    }

    return init
}

export function AESencryption(message: string, key: string): cryptojs.lib.CipherParams {
    return cryptojs.AES.encrypt(message, key)
}

export function AESdecryption(encryptedMessage: string, key: string): string|cryptojs.lib.WordArray {
    return cryptojs.AES.decrypt(encryptedMessage, key)
}