const { MongoClient, ClientEncryption, Binary } = require('mongodb');
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
    this.encryption = null;
  }

  async initialize(uri) {
    try {
      // Create a new MongoClient
      this.client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        monitorCommands: true
      });

      await this.client.connect();

      // Create the key vault collection if it doesn't exist
      const database = this.client.db();
      const collections = await database.listCollections({ name: '__keyVault' }).toArray();
      if (collections.length === 0) {
        await database.createCollection('__keyVault');
      }

      // Convert the base64 key to a Binary buffer
      const localKey = Buffer.from(process.env.MONGO_CLIENT_ENCRYPTION_KEY, 'base64');

      // Configure encryption
      this.encryption = new ClientEncryption(this.client, {
        keyVaultNamespace: this.keyVaultNamespace,
        kmsProviders: {
          local: {
            key: localKey
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
      if (!this.encryption) {
        throw new Error('Encryption client not initialized');
      }

      const key = await this.encryption.createDataKey('local', {
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
      if (!this.encryption) {
        throw new Error('Encryption client not initialized');
      }

      const keyVaultDb = this.client.db();
      const keyVaultColl = keyVaultDb.collection('__keyVault');
      
      let key = await keyVaultColl.findOne({ 
        keyAltNames: process.env.MONGO_ENCRYPTION_KEY_NAME 
      });

      if (!key) {
        logger.info('No existing encryption key found, creating new one');
        key = await this.createEncryptionKey();
      }

      logger.info('Retrieved encryption key successfully');
      return key._id;
    } catch (error) {
      logger.error('Error getting encryption key:', error);
      throw error;
    }
  }

  async encryptField(value) {
    try {
      if (!this.encryption) {
        throw new Error('Encryption client not initialized');
      }

      const keyId = await this.getEncryptionKey();
      
      const encryptedValue = await this.encryption.encrypt(
        value,
        {
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512_Deterministic',
          keyId
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
      if (!this.encryption) {
        throw new Error('Encryption client not initialized');
      }

      const decryptedValue = await this.encryption.decrypt(encryptedValue);
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