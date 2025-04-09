require('dotenv').config();
const { MongoClient } = require('mongodb');

async function verify() {
  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db();

    // Find the superadmin
    const superadmins = db.collection('superadmins');
    const superAdmin = await superadmins.findOne({ 
      auth0Id: '100058725052231554534' 
    });

    if (superAdmin) {
      console.log('Super admin exists:', superAdmin);
    } else {
      console.log('Super admin not found');
    }

    // Close connection
    await client.close();
  } catch (error) {
    console.error('Error during verification:', error);
    process.exit(1);
  }
}

verify();