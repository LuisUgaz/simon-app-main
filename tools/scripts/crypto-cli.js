#!/usr/bin/env node

const CryptoJS = require('crypto-js');
const NodeRSA = require('node-rsa');

// Variables de entorno
const KV =
  process.env.KV || 'nZr4u7x!A%D*G-KaNdRgUkXp2s5v8y/B|zAvR2NI87bBx746n';

class CryptAdapter {
  constructor(publicKey) {
    // Inicializamos pks y pkv con valores de la variable de entorno
    this.pks = KV.split('|')[0];
    this.pkv = KV.split('|')[1];
    this.pbk = publicKey || ''; // Clave pública opcional

    // Inicializamos el cifrador RSA
    this.encryptor = null;
    if (this.pbk) {
      try {
        this.encryptor = new NodeRSA();
        this.encryptor.importKey(this.pbk, 'public');
      } catch (error) {
        console.warn(
          '⚠️  Advertencia: No se pudo configurar la clave RSA:',
          error.message,
        );
        this.pbk = '';
      }
    }
  }

  /**
   * Encripta un mensaje con AES usando las claves pks y pkv.
   * @param message El mensaje a encriptar.
   * @returns Un string con el texto cifrado en Base64.
   */
  ecy(message) {
    try {
      const key = CryptoJS.enc.Utf8.parse(this.pks);
      const iv = CryptoJS.enc.Utf8.parse(this.pkv);

      const encrypted = CryptoJS.AES.encrypt(message, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return encrypted.toString();
    } catch (error) {
      throw new Error(`Error al encriptar: ${error.message}`);
    }
  }

  /**
   * Desencripta un mensaje cifrado con AES.
   * @param message El texto cifrado en Base64.
   * @returns El texto plano desencriptado.
   */
  dcy(message) {
    if (!message) {
      return '';
    }

    try {
      const key = CryptoJS.enc.Utf8.parse(this.pks);
      const iv = CryptoJS.enc.Utf8.parse(this.pkv);

      const decrypted = CryptoJS.AES.decrypt(message, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const result = decrypted.toString(CryptoJS.enc.Utf8);

      if (!result && message.trim() !== '') {
        throw new Error(
          'No se pudo desencriptar el mensaje. Verifica que el texto encriptado y las claves sean correctos.',
        );
      }

      return result;
    } catch (error) {
      if (error.message.includes('Malformed UTF-8')) {
        throw new Error(
          'Error: El texto no se puede desencriptar. Posibles causas:\n' +
            '  - El texto no fue encriptado con las mismas claves\n' +
            '  - El texto está corrupto o incompleto\n' +
            '  - Las claves de encriptación son diferentes',
        );
      }
      throw new Error(`Error al desencriptar: ${error.message}`);
    }
  }

  /**
   * Encripta un mensaje de forma asíncrona. Si hay una clave pública RSA configurada, la utiliza.
   * Si no, usa AES.
   * @param message El mensaje a encriptar.
   * @returns Un string con el texto cifrado.
   */
  ecyAsync(message) {
    const text = `${message}`.trim();
    let encryptedMessage = '';

    if (this.pbk && this.encryptor) {
      try {
        encryptedMessage = this.encryptor.encrypt(text, 'base64');
      } catch (error) {
        throw new Error(`Error al encriptar con RSA: ${error.message}`);
      }
    } else {
      encryptedMessage = this.ecy(text);
    }

    return encryptedMessage;
  }

  /**
   * Configura una nueva clave pública para la encriptación RSA.
   * @param publicKey La clave pública en formato PEM.
   */
  setPublicKey(publicKey) {
    this.pbk = publicKey;
    try {
      this.encryptor = new NodeRSA();
      this.encryptor.importKey(this.pbk, 'public');
    } catch (error) {
      throw new Error(
        `Error al configurar clave pública RSA: ${error.message}`,
      );
    }
  }

  /**
   * Muestra información sobre las claves actuales
   */
  showKeyInfo() {
    console.log('Información de claves:');
    console.log(
      `Clave AES (pks): "${this.pks}" (${this.pks.length} caracteres)`,
    );
    console.log(`IV AES (pkv): "${this.pkv}" (${this.pkv.length} caracteres)`);
    console.log(`Clave RSA configurada: ${this.pbk ? 'SÍ' : 'NO'}`);
    if (this.pbk) {
      console.log(`Longitud clave RSA: ${this.pbk.length} caracteres`);
    }
  }

  /**
   * Valida si un texto parece ser encriptado
   */
  isEncryptedText(text) {
    return /^[A-Za-z0-9+/]*={0,2}$/.test(text) && text.length > 10;
  }
}

// Función para leer archivo de clave pública
function readPublicKeyFile(filePath) {
  try {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.resolve(filePath);
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    throw new Error(`Error al leer archivo de clave pública: ${error.message}`);
  }
}

// Función principal
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('🔐 Herramienta de Encriptación/Desencriptación');
    console.log('');
    console.log('Uso:');
    console.log('  node crypto-cli.js encrypt "texto"');
    console.log('  node crypto-cli.js decrypt "texto_encriptado"');
    console.log('  node crypto-cli.js encrypt-async "texto" [clave_publica]');
    console.log('  node crypto-cli.js set-public-key "clave_publica_pem"');
    console.log('  node crypto-cli.js set-public-key-file "ruta/archivo.pem"');
    console.log('  node crypto-cli.js test');
    console.log('  node crypto-cli.js info');
    console.log('');
    console.log('Comandos cortos:');
    console.log('  enc = encrypt');
    console.log('  dec = decrypt');
    console.log('  enc-async = encrypt-async');
    console.log('  set-key = set-public-key');
    console.log('  set-key-file = set-public-key-file');
    console.log('');
    console.log('Variables de entorno:');
    console.log('  KV="clave|iv" node crypto-cli.js ...');
    console.log('');
    console.log('Ejemplos:');
    console.log('  # Encriptación AES básica');
    console.log('  node crypto-cli.js encrypt "Hola mundo"');
    console.log('');
    console.log('  # Encriptación con RSA');
    console.log(
      '  node crypto-cli.js encrypt-async "texto" "-----BEGIN PUBLIC KEY-----\\n...\\n-----END PUBLIC KEY-----"',
    );
    console.log('');
    console.log('  # Configurar clave RSA desde archivo');
    console.log('  node crypto-cli.js set-key-file "./public_key.pem"');
    console.log('  node crypto-cli.js encrypt-async "texto secreto"');
    console.log('');
    console.log('  # Con claves AES personalizadas');
    console.log(
      '  KV="miclave123456789|miiv123456789012" node crypto-cli.js encrypt "texto"',
    );
    return;
  }

  const command = args[0];
  const text = args[1];
  const publicKey = args[2];

  try {
    const cryptAdapter = new CryptAdapter(publicKey);

    if (command === 'encrypt' || command === 'enc') {
      if (!text) {
        console.log('❌ Error: Proporciona un texto para encriptar');
        console.log('Ejemplo: node crypto-cli.js encrypt "Mi mensaje secreto"');
        return;
      }
      const encrypted = cryptAdapter.ecy(text);
      console.log('✅ Texto encriptado (AES):');
      console.log(encrypted);
      console.log('');
      console.log('💡 Para desencriptar usa:');
      console.log(`node crypto-cli.js decrypt "${encrypted}"`);
    } else if (command === 'decrypt' || command === 'dec') {
      if (!text) {
        console.log('❌ Error: Proporciona un texto para desencriptar');
        console.log('Ejemplo: node crypto-cli.js decrypt "texto_encriptado"');
        return;
      }

      // Validación previa
      if (!cryptAdapter.isEncryptedText(text)) {
        console.log(
          '⚠️  Advertencia: El texto no parece ser un mensaje encriptado válido',
        );
        console.log(
          '   Los mensajes encriptados suelen ser texto Base64 (letras, números, +, /, =)',
        );
      }

      const decrypted = cryptAdapter.dcy(text);
      console.log('✅ Texto desencriptado:');
      console.log(decrypted);
    } else if (command === 'encrypt-async' || command === 'enc-async') {
      if (!text) {
        console.log('❌ Error: Proporciona un texto para encriptar');
        console.log(
          'Ejemplo: node crypto-cli.js encrypt-async "Mi mensaje secreto" [clave_publica]',
        );
        return;
      }

      const encrypted = cryptAdapter.ecyAsync(text);
      const method = cryptAdapter.pbk ? 'RSA' : 'AES';
      console.log(`✅ Texto encriptado (${method}):`);
      console.log(encrypted);

      if (method === 'AES') {
        console.log('');
        console.log('💡 Para desencriptar usa:');
        console.log(`node crypto-cli.js decrypt "${encrypted}"`);
        console.log('');
        console.log('ℹ️  Se usó AES porque no hay clave RSA configurada.');
        console.log(
          '   Para usar RSA, proporciona una clave pública como tercer argumento.',
        );
      } else {
        console.log('');
        console.log(
          'ℹ️  Se usó encriptación RSA. Para desencriptar necesitarás la clave privada correspondiente.',
        );
      }
    } else if (command === 'set-public-key' || command === 'set-key') {
      if (!text) {
        console.log('❌ Error: Proporciona una clave pública en formato PEM');
        console.log(
          'Ejemplo: node crypto-cli.js set-public-key "-----BEGIN PUBLIC KEY-----\\n...\\n-----END PUBLIC KEY-----"',
        );
        return;
      }

      cryptAdapter.setPublicKey(text);
      console.log('✅ Clave pública RSA configurada correctamente');
      console.log('');
      console.log('💡 Ahora puedes usar:');
      console.log('node crypto-cli.js encrypt-async "tu mensaje"');
    } else if (
      command === 'set-public-key-file' ||
      command === 'set-key-file'
    ) {
      if (!text) {
        console.log(
          '❌ Error: Proporciona la ruta al archivo de clave pública',
        );
        console.log(
          'Ejemplo: node crypto-cli.js set-key-file "./public_key.pem"',
        );
        return;
      }

      const keyContent = readPublicKeyFile(text);
      cryptAdapter.setPublicKey(keyContent);
      console.log('✅ Clave pública RSA cargada desde archivo correctamente');
      console.log(`📁 Archivo: ${text}`);
      console.log('');
      console.log('💡 Ahora puedes usar:');
      console.log('node crypto-cli.js encrypt-async "tu mensaje"');
    } else if (command === 'test') {
      console.log('🧪 Ejecutando pruebas de encriptación/desencriptación...');
      console.log('');

      // Prueba AES
      const testMessage = 'Mensaje de prueba 🔐';
      console.log('📋 Prueba AES:');
      console.log(`   Mensaje original: "${testMessage}"`);

      const encrypted = cryptAdapter.ecy(testMessage);
      console.log(`   Mensaje encriptado: "${encrypted}"`);

      const decrypted = cryptAdapter.dcy(encrypted);
      console.log(`   Mensaje desencriptado: "${decrypted}"`);

      const aesSuccess = testMessage === decrypted;
      console.log(`   Resultado: ${aesSuccess ? '✅ EXITOSO' : '❌ FALLIDO'}`);

      // Prueba ecyAsync (sin RSA)
      console.log('');
      console.log('📋 Prueba ecyAsync (sin RSA):');
      const encryptedAsync = cryptAdapter.ecyAsync(testMessage);
      console.log(`   Mensaje encriptado: "${encryptedAsync}"`);

      const decryptedAsync = cryptAdapter.dcy(encryptedAsync);
      console.log(`   Mensaje desencriptado: "${decryptedAsync}"`);

      const asyncSuccess = testMessage === decryptedAsync;
      console.log(
        `   Resultado: ${asyncSuccess ? '✅ EXITOSO' : '❌ FALLIDO'}`,
      );

      console.log('');
      if (aesSuccess && asyncSuccess) {
        console.log(
          '🎉 ¡Todas las pruebas EXITOSAS! La encriptación/desencriptación funciona correctamente.',
        );
      } else {
        console.log('❌ Algunas pruebas FALLARON. Revisa la configuración.');
      }

      if (!cryptAdapter.pbk) {
        console.log('');
        console.log('ℹ️  Para probar RSA, configura una clave pública con:');
        console.log(
          '   node crypto-cli.js set-key-file "ruta/clave_publica.pem"',
        );
      }
    } else if (command === 'info') {
      cryptAdapter.showKeyInfo();
    } else {
      console.log('❌ Comando no reconocido:', command);
      console.log(
        'Comandos disponibles: encrypt, decrypt, encrypt-async, set-public-key, set-public-key-file, test, info',
      );
      console.log('Usa "node crypto-cli.js" para ver la ayuda completa.');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
