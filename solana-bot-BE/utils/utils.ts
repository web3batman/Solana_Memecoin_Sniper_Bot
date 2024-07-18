import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58';
import fs from 'fs'
import pino, { Logger } from 'pino';

export const getPulbicKey = async (privateKeyHex: string) => {
    try {
        const keypair = Keypair.fromSecretKey(
            bs58.decode(privateKeyHex)
        )
        return keypair.publicKey.toString()
    } catch (e) {
        throw ('Invalid Private Key')
    }
}


export const readData = async (Path: string): Promise<any> => {
    return JSON.parse(fs.readFileSync(Path, `utf8`));
}

export const writeData = async (data: any, path: any) => {
    const dataJson = JSON.stringify(data, null, 4);
    fs.writeFile(path, dataJson, (err) => {
        if (err) {
            console.log('Error writing file:', err);
        } else {
            console.log(`wrote file ${path}`);
        }
    });
}


export const retrieveEnvVariable = (variableName: string, logger: Logger) => {
    const variable = process.env[variableName] || '';
    if (!variable) {
        logger.error(`${variableName} is not set`);
        process.exit(1);
    }
    return variable;
};

export const transport = pino.transport({
    target: 'pino-pretty',
});

export const logger = pino(
    {
        level: 'info',
        redact: ['poolKeys'],
        serializers: {
            error: pino.stdSerializers.err,
        },
        base: undefined,
    },
    transport,
);
