const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const toDrop = ['products', 'orders', 'admin_tokens'];
    for (const name of toDrop) {
      const exists = await db.listCollections({ name }).hasNext();
      if (exists) {
        await db.collection(name).drop();
        console.log('dropped collection', name);
      }
    }

    const { PRODUCTS } = require('../lib/shopData');
    const prodCol = db.collection('products');
    await prodCol.insertMany(PRODUCTS.map(p => ({ ...p })));
    console.log('seeded products:', PRODUCTS.length);

    const token = (Math.random().toString(36).slice(2) + Date.now().toString(36));
    const adminCol = db.collection('admin_tokens');
    await adminCol.insertOne({ token, label: 'admin', createdAt: new Date().toISOString() });
    console.log('created admin token:', token);

    console.log('DB reset complete.');
  } catch (err) {
    console.error('Error resetting DB:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();
