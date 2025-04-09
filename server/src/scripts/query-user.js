require('dotenv').config();
const mongoose = require('mongoose');

async function queryUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const User = mongoose.model('User', new mongoose.Schema({
      auth0Id: String,
      email: Object,
      name: String,
      tenants: Array,
    }));
    
    const SuperAdmin = mongoose.model('SuperAdmin', new mongoose.Schema({
      auth0Id: String,
    }));

    console.log('Querying user...');
    const user = await User.findOne({ auth0Id: 'google-oauth2|100058725052231554534' });
    console.log('User:', JSON.stringify(user, null, 2));

    console.log('\nChecking super admin status...');
    const isSuperAdmin = await SuperAdmin.exists({ auth0Id: 'google-oauth2|100058725052231554534' });
    console.log('Is Super Admin:', !!isSuperAdmin);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

queryUser();
