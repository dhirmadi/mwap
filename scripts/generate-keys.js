const crypto = require('crypto');

// Generate encryption key (96 bytes for MongoDB client-side encryption)
const encryptionKey = crypto.randomBytes(96).toString('base64');

// Generate JWT secret (64 bytes)
const jwtSecret = crypto.randomBytes(64).toString('base64');

console.log('\nGenerated Security Keys\n' + '='.repeat(50));
console.log('\nMongoDB Client Encryption Key:');
console.log('----------------------------');
console.log(encryptionKey);
console.log('\nJWT Secret:');
console.log('-----------');
console.log(jwtSecret);
console.log('\n' + '='.repeat(50));
console.log('\nAdd these values to your .env file for:');
console.log('MONGO_CLIENT_ENCRYPTION_KEY=<MongoDB Client Encryption Key>');
console.log('JWT_SECRET=<JWT Secret>\n');
