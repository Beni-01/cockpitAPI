import { Injectable } from "@nestjs/common";
import * as crypto from 'crypto';

@Injectable()
export class RSAKeyGen{

    constructor(){}
    
    generateRSAKeys(): { privateKey: string, publicKey: string } {
        // Générer une paire de clés RSA de 4096 bits synchronement
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
          modulusLength: 4096,  // longueur de la clé en bits
          publicKeyEncoding: {
            type: 'pkcs1',      // format de la clé publique
            format: 'pem'       // format d'encodage (PEM est couramment utilisé)
          },
          privateKeyEncoding: {
            type: 'pkcs1',      // format de la clé privée
            format: 'pem',      // format d'encodage (PEM est couramment utilisé)
            cipher: 'aes-256-cbc', // chiffrement de la clé privée (optionnel)
            passphrase: 'plus jamais seuls' // phrase secrète pour le chiffrement (optionnel)
          }
        });
    
        // Retourner les clés générées
        return { privateKey, publicKey };
      }
}