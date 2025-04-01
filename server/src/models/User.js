// Temporary in-memory storage for development
const users = new Map();

class User {
  constructor(data) {
    this.auth0Id = data.auth0Id;
    this.email = data.email;
    this.name = data.name;
    this.picture = data.picture;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.phoneNumber = data.phoneNumber || '';
    this.title = data.title || '';
    this.department = data.department || '';
    this.location = data.location || '';
    this.timezone = data.timezone || 'UTC';
    this.bio = data.bio || '';
    this.preferences = {
      theme: data.preferences?.theme || 'system',
      notifications: {
        email: data.preferences?.notifications?.email ?? true,
        push: data.preferences?.notifications?.push ?? true,
      },
      language: data.preferences?.language || 'en',
    };
    this.status = data.status || 'active';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static async findOne(query) {
    return users.get(query.auth0Id) || null;
  }

  async save() {
    this.updatedAt = new Date().toISOString();
    users.set(this.auth0Id, this);
    return this;
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
    };
  }
}

module.exports = User;