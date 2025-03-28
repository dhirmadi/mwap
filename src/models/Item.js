const mongoose = require('mongoose');
const encryption = require('../config/encryption');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sensitiveData: {
    type: Buffer,  // For encrypted data
    required: false
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  isEncrypted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      if (ret.sensitiveData) {
        ret.sensitiveData = '<encrypted>';
      }
      delete ret.__v;
      return ret;
    }
  }
});

// Middleware to handle encryption
itemSchema.pre('save', async function(next) {
  try {
    // Only encrypt if sensitiveData is present and not already encrypted
    if (this.sensitiveData && !this.isEncrypted && typeof this.sensitiveData !== 'object') {
      const encryptedData = await encryption.encryptField(this.sensitiveData);
      this.sensitiveData = encryptedData;
      this.isEncrypted = true;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to decrypt sensitive data
itemSchema.methods.decryptSensitiveData = async function() {
  if (this.sensitiveData && this.isEncrypted) {
    try {
      const decryptedData = await encryption.decryptField(this.sensitiveData);
      return decryptedData;
    } catch (error) {
      throw new Error('Failed to decrypt sensitive data');
    }
  }
  return null;
};

// Let Atlas handle index optimization
const Item = mongoose.model('Item', itemSchema);

module.exports = Item;