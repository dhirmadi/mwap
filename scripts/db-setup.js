require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../shared/config/database');

async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Create indexes
    const collections = mongoose.connection.collections;
    for (const collectionName in collections) {
      const collection = collections[collectionName];
      
      // Create basic indexes
      if (collectionName === 'items') {
        await collection.createIndex({ name: 1 });
        await collection.createIndex({ createdAt: -1 });
        await collection.createIndex({ updatedAt: -1 });
        console.log(`Created indexes for ${collectionName}`);
      }
    }

    // Insert sample data if this is a review app
    if (process.env.HEROKU_APP_NAME && process.env.HEROKU_APP_NAME.includes('review')) {
      const Item = require('../src/models/Item');
      
      await Item.create({
        name: 'Sample Item',
        description: 'This is a sample item for review app',
        metadata: { type: 'review' },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Created sample data');
    }

    console.log('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during database setup:', error);
    process.exit(1);
  }
}

setupDatabase();