const { ClientEncryption } = require('mongodb-client-encryption');
const { MongoClient } = require('mongodb');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/encryption-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/encryption.log' })
  ]
});

class DatabaseEncryption {
  constructor() {
    this.keyVaultNamespace = 'encryption.__keyVault';
    this.client = null;
    this.clientEncryption = null;
  }

  async initialize(uri) {
    try {
      // Create a new MongoClient for managing encryption
      this.client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      await this.client.connect();

      // Create a ClientEncryption instance
      this.clientEncryption = new ClientEncryption(this.client, {
        keyVaultNamespace: this.keyVaultNamespace,
        kmsProviders: {
          local: {
            key: Buffer.from(process.env.MONGO_CLIENT_ENCRYPTION_KEY, 'base64')
          }
        }
      });

      logger.info('Database encryption initialized successfully');
    } catch (error) {
      logger.error('Error initializing database encryption:', error);
      throw error;
    }
  }

  async createEncryptionKey() {
    try {
      if (!this.clientEncryption) {
        throw new Error('Encryption client not initialized');
      }

      const key = await this.clientEncryption.createDataKey('local', {
        keyAltNames: [process.env.MONGO_ENCRYPTION_KEY_NAME]
      });

      logger.info('Encryption key created successfully');
      return key;
    } catch (error) {
      logger.error('Error creating encryption key:', error);
      throw error;
    }
  }

  async getEncryptionKey() {
    try {
      if (!this.clientEncryption) {
        throw new Error('Encryption client not initialized');
      }

      const key = await this.clientEncryption.getKeyByAltName(
        process.env.MONGO_ENCRYPTION_KEY_NAME
      );

      if (!key) {
        logger.info('No existing encryption key found, creating new one');
        return await this.createEncryptionKey();
      }

      logger.info('Retrieved existing encryption key');
      return key;
    } catch (error) {
      logger.error('Error getting encryption key:', error);
      throw error;
    }
  }

  async encryptField(value) {
    try {
      if (!this.clientEncryption) {
        throw new Error('Encryption client not initialized');
      }

      const key = await this.getEncryptionKey();
      
      const encryptedValue = await this.clientEncryption.encrypt(
        value,
        {
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512_Deterministic',
          keyId: key
        }
      );

      return encryptedValue;
    } catch (error) {
      logger.error('Error encrypting field:', error);
      throw error;
    }
  }

  async decryptField(encryptedValue) {
    try {
      if (!this.clientEncryption) {
        throw new Error('Encryption client not initialized');
      }

      const decryptedValue = await this.clientEncryption.decrypt(encryptedValue);
      return decryptedValue;
    } catch (error) {
      logger.error('Error decrypting field:', error);
      throw error;
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      logger.info('Database encryption client closed');
    }
  }
}

module.exports = new DatabaseEncryption();