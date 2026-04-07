import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';
import { KV } from '@env';

export class CryptAdapter {
  private pks: string;
  private pkv: string;
  private pbk: string;
  private encryptor: JSEncrypt;

  constructor(publicKey?: string) {
    // Inicializamos pks y pkv con valores de la variable de entorno
    this.pks = KV.split('|')[0];
    this.pkv = KV.split('|')[1];
    this.pbk = publicKey || ''; // Clave pública opcional

    // Inicializamos el cifrador RSA
    this.encryptor = new JSEncrypt();
    if (this.pbk) {
      this.encryptor.setPublicKey(this.pbk);
    }
  }

  /**
   * Encripta un mensaje con AES usando las claves pks y pkv.
   * @param message El mensaje a encriptar.
   * @returns Un string con el texto cifrado en Base64.
   */
  ecy(message: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.pks);
    const iv = CryptoJS.enc.Utf8.parse(this.pkv);

    const encrypted = CryptoJS.AES.encrypt(message, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
  }

  /**
   * Desencripta un mensaje cifrado con AES.
   * @param message El texto cifrado en Base64.
   * @returns El texto plano desencriptado.
   */
  dcy(message: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.pks);
    const iv = CryptoJS.enc.Utf8.parse(this.pkv);

    if (!message) {
      return '';
    }

    const decrypted = CryptoJS.AES.decrypt(message, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Encripta un mensaje de forma asíncrona. Si hay una clave pública RSA configurada, la utiliza.
   * Si no, usa AES.
   * @param message El mensaje a encriptar.
   * @returns Un string con el texto cifrado.
   */
  ecyAsync(message: string): string {
    const text = `${message}`.trim();

    let encryptedMessage = '';

    if (this.pbk) {
      encryptedMessage = this.encryptor.encrypt(text) || '';
    } else {
      encryptedMessage = this.ecy(text);
    }

    return encryptedMessage;
  }

  /**
   * Configura una nueva clave pública para la encriptación RSA.
   * @param publicKey La clave pública en formato PEM.
   */
  setPublicKey(publicKey: string): void {
    this.pbk = publicKey;
    this.encryptor.setPublicKey(this.pbk);
  }
}
