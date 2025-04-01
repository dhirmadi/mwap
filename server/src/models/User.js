// Temporary in-memory storage for development
const users = new Map();

class User {
  constructor(data) {
    // Auth0 managed fields (read-only)
    this.auth0Id = data.auth0Id;
    this.email = data.email;
    this.name = data.name;
    this.picture = data.picture;

    // Local profile fields (editable)
    this.firstName = data.firstName || this.extractFirstName(data.name);
    this.lastName = data.lastName || this.extractLastName(data.name);
    this.phoneNumber = data.phoneNumber || '';
    this.title = data.title || '';
    this.department = data.department || '';
    this.location = data.location || '';
    this.timezone = data.timezone || 'UTC';
    this.bio = data.bio || '';
    
    // Preferences
    this.preferences = {
      theme: data.preferences?.theme || 'system',
      notifications: {
        email: data.preferences?.notifications?.email ?? true,
        push: data.preferences?.notifications?.push ?? true,
      },
      language: data.preferences?.language || 'en',
    };

    // Metadata
    this.status = data.status || 'active';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.lastAuth0Sync = new Date().toISOString();
  }

  static async findOne(query) {
    return users.get(query.auth0Id) || null;
  }

  async save() {
    this.updatedAt = new Date().toISOString();
    users.set(this.auth0Id, this);
    return this;
  }

  extractFirstName(fullName) {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  }

  extractLastName(fullName) {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }

  // Sync user data with Auth0
  syncWithAuth0Data(auth0Data) {
    // Update Auth0-managed fields
    this.email = auth0Data.email;
    this.name = auth0Data.name;
    this.picture = auth0Data.picture;

    // Only update first/last name if they haven't been customized
    if (!this.firstName && !this.lastName) {
      this.firstName = this.extractFirstName(auth0Data.name);
      this.lastName = this.extractLastName(auth0Data.name);
    }

    this.lastAuth0Sync = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.auth0Id,
      auth0Id: this.auth0Id,
      email: this.email,
      name: this.name,
      picture: this.picture,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      title: this.title,
      department: this.department,
      location: this.location,
      timezone: this.timezone,
      bio: this.bio,
      preferences: this.preferences,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastAuth0Sync: this.lastAuth0Sync,
    };
  }
}

module.exports = User;