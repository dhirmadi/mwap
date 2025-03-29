// Create application database and user
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE);

// Create application user
db.createUser({
  user: process.env.MONGO_INITDB_ROOT_USERNAME,
  pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
  roles: [
    { role: 'readWrite', db: process.env.MONGO_INITDB_DATABASE },
    { role: 'dbAdmin', db: process.env.MONGO_INITDB_DATABASE }
  ]
});

// Create collections
db.createCollection('items');

// Create indexes
db.items.createIndex({ "name": 1 });
db.items.createIndex({ "createdAt": -1 });
db.items.createIndex({ "updatedAt": -1 });

// Insert some sample data
db.items.insertMany([
  {
    name: 'Sample Item 1',
    description: 'This is a sample item',
    metadata: { type: 'test' },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Sample Item 2',
    description: 'This is another sample item',
    metadata: { type: 'test' },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);