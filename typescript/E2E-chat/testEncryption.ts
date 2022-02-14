import * as cryptojs from "crypto-js";

let encryption = cryptojs.AES.encrypt("Hello World", "1");
let decryption = cryptojs.AES.decrypt(encryption, "1");
let misdecryption = cryptojs.AES.decrypt(encryption, "2")

console.log("hello")
console.log(encryption.toString(), decryption.toString(cryptojs.enc.Utf8));
console.log(encryption.toString(), misdecryption.toString(cryptojs.enc.Utf8));