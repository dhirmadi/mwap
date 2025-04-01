const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  language: {
    type: String,
    default: 'en'
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: String,
  firstName: String,
  lastName: String,
  phoneNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\+?[\d\s-()]{8,}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  title: String,
  department: String,
  location: String,
  timezone: {
    type: String,
    default: 'UTC'
  },
  bio: {
    type: String,
    maxLength: [500, 'Bio must be less than 500 characters']
  },
  preferences: {
    type: userPreferencesSchema,
    default: () => ({})
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  lastAuth0Sync: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create compound index for better query performance
userSchema.index({ auth0Id: 1, email: 1 }, { unique: true });

// Pre-save middleware
userSchema.pre('save', function(next) {
  // Ensure required Auth0 fields are present
  if (!this.auth0Id || !this.email || !this.name) {
    next(new Error('Required Auth0 fields missing: auth0Id, email, and name are required'));
    return;
  }

  // Set timestamps
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  this.updatedAt = new Date();

  next();
});

// Instance methods
userSchema.methods.syncWithAuth0Data = function(auth0Data) {
  this.email = auth0Data.email;
  this.name = auth0Data.name;
  this.picture = auth0Data.picture;

  // Only update first/last name if they haven't been customized
  if (!this.firstName && !this.lastName) {
    this.firstName = this.extractFirstName(auth0Data.name);
    this.lastName = this.extractLastName(auth0Data.name);
  }

  this.lastAuth0Sync = new Date();
};

userSchema.methods.extractFirstName = function(fullName) {
  if (!fullName) return '';
  return fullName.split(' ')[0];
};

userSchema.methods.extractLastName = function(fullName) {
  if (!fullName) return '';
  const parts = fullName.split(' ');
  return parts.length > 1 ? parts.slice(1).join(' ') : '';
};

// Static methods
userSchema.statics.findByAuth0Id = function(auth0Id) {
  return this.findOne({ auth0Id });
};

const User = mongoose.model('User', userSchema);

module.exports = User;