require('dotenv').config();
const { MongoClient } = require('mongodb');

async function seed() {
  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db();

    // Create superadmins collection if it doesn't exist
    if (!await db.listCollections({ name: 'superadmins' }).hasNext()) {
      await db.createCollection('superadmins');
    }

    // Check if super admin already exists
    const superadmins = db.collection('superadmins');
    const existingSuperAdmin = await superadmins.findOne({ 
      auth0Id: '100058725052231554534' 
    });

    if (!existingSuperAdmin) {
      // Create the super admin
      await superadmins.insertOne({
        auth0Id: '100058725052231554534',
        createdAt: new Date()
      });
      console.log('Super admin created successfully');
    } else {
      console.log('Super admin already exists');
    }

    // Close connection
    await client.close();
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();