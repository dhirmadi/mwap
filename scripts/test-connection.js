require('dotenv').config();
const mongoose = require('mongoose');
const encryption = require('../src/config/encryption');
const { connectDB } = require('../src/config/database');
const Item = require('../src/models/Item');

async function testConnection() {
    try {
        console.log('\nTesting MongoDB Connection and Encryption\n' + '='.repeat(50));
        
        // Step 1: Initialize encryption
        console.log('\n1. Initializing encryption...');
        await encryption.initialize(process.env.MONGO_URI);
        console.log('✅ Encryption initialized successfully');

        // Step 2: Connect to MongoDB
        console.log('\n2. Connecting to MongoDB...');
        await connectDB();
        console.log('✅ Connected to MongoDB successfully');

        // Step 3: Test encryption by creating a sample item
        console.log('\n3. Testing encryption with sample data...');
        const testItem = new Item({
            name: 'Test Item',
            description: 'This is a test item',
            sensitiveData: 'This is sensitive information that should be encrypted'
        });

        const savedItem = await testItem.save();
        console.log('✅ Test item created successfully');
        console.log('Item ID:', savedItem._id);

        // Step 4: Retrieve and decrypt the item
        console.log('\n4. Retrieving and decrypting data...');
        const retrievedItem = await Item.findById(savedItem._id);
        const decryptedData = await retrievedItem.decryptSensitiveData();
        console.log('✅ Data retrieved and decrypted successfully');
        console.log('Decrypted sensitive data:', decryptedData);

        // Step 5: Clean up test data
        console.log('\n5. Cleaning up test data...');
        await Item.findByIdAndDelete(savedItem._id);
        console.log('✅ Test data cleaned up successfully');

        console.log('\n' + '='.repeat(50));
        console.log('All tests passed successfully! Your MongoDB setup is working correctly.');
        
        // Close connections
        await mongoose.connection.close();
        await encryption.close();
        
        return true;
    } catch (error) {
        console.error('\n❌ Error during testing:', error.message);
        console.error('\nDetailed error:', error);
        
        if (error.message.includes('MONGO_URI')) {
            console.log('\nPossible issues with MONGO_URI:');
            console.log('1. Check if the connection string is correct');
            console.log('2. Verify username and password');
            console.log('3. Ensure the IP address is whitelisted in MongoDB Atlas');
            console.log('4. Confirm the database name is correct');
        }

        if (error.message.includes('encryption')) {
            console.log('\nPossible issues with encryption:');
            console.log('1. Verify MONGO_CLIENT_ENCRYPTION_KEY is set correctly');
            console.log('2. Check if MONGO_ENCRYPTION_KEY_NAME is defined');
        }

        try {
            if (mongoose.connection.readyState === 1) {
                await mongoose.connection.close();
            }
            await encryption.close();
        } catch (closeError) {
            console.error('Error while closing connections:', closeError);
        }

        return false;
    }
}

// Run the test if this script is run directly
if (require.main === module) {
    testConnection()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = testConnection;