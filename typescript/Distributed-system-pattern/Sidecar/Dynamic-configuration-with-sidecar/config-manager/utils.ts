import crypto from "crypto";
import { readFileSync, writeFileSync } from "fs";

export function getChecksum(filePath: string): string {
    let fileBuffer = readFileSync(filePath)    
    let checksum = crypto.createHash("sha256").update(fileBuffer);

    return checksum.digest("hex")
}

export function updateConfig(srcPath:string, destPath:string) {
    let fileBuffer = readFileSync(srcPath)
    writeFileSync(destPath, fileBuffer)
}