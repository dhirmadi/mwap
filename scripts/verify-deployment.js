const axios = require('axios');

async function verifyDeployment(baseUrl) {
    console.log('\nVerifying Deployment\n' + '='.repeat(50));
    
    try {
        // Check health endpoint
        console.log('\n1. Checking health endpoint...');
        const healthResponse = await axios.get(`${baseUrl}/health`);
        if (healthResponse.data.status === 'healthy') {
            console.log('✅ Health check passed');
        } else {
            throw new Error('Health check failed');
        }

        // Check MongoDB status
        console.log('\n2. Checking MongoDB connection...');
        const statusResponse = await axios.get(`${baseUrl}/api/status`);
        if (statusResponse.data.connectionState === 1) {
            console.log('✅ MongoDB connection verified');
        } else {
            throw new Error('MongoDB connection check failed');
        }

        // Test CRUD operations
        console.log('\n3. Testing CRUD operations...');
        
        // Create
        const createResponse = await axios.post(`${baseUrl}/api/items`, {
            name: 'Test Item',
            description: 'Test Description'
        });
        console.log('✅ Create operation successful');
        
        const itemId = createResponse.data._id;
        
        // Read
        const readResponse = await axios.get(`${baseUrl}/api/items/${itemId}`);
        if (readResponse.data.name === 'Test Item') {
            console.log('✅ Read operation successful');
        } else {
            throw new Error('Read operation failed');
        }
        
        // Clean up
        await axios.delete(`${baseUrl}/api/items/${itemId}`);
        console.log('✅ Delete operation successful');

        console.log('\n' + '='.repeat(50));
        console.log('✅ All verification checks passed successfully!');
        return true;
    } catch (error) {
        console.error('\n❌ Deployment verification failed:', error.message);
        if (error.response) {
            console.error('Response:', {
                status: error.response.status,
                data: error.response.data
            });
        }
        return false;
    }
}

// Run the verification if this script is run directly
if (require.main === module) {
    const baseUrl = process.argv[2] || 'http://localhost:3100';
    verifyDeployment(baseUrl)
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = verifyDeployment;