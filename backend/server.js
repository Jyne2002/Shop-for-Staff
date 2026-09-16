require('dotenv').config({ path: '../.env.local' });
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI missing in .env.local');
  process.exit(1);
}

let client;
async function getDb() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db();
}

app.get('/products', async (req, res) => {
  try {
    const db = await getDb();
    const items = await db.collection('products').find({}).toArray();
    if (!items.length) {
      // seed from local file if available
      try {
        const { PRODUCTS } = require('../lib/shopData');
        await db.collection('products').insertMany(PRODUCTS.map(p => ({ ...p })));
        const seeded = await db.collection('products').find({}).toArray();
        return res.json(seeded);
      } catch (e) {
        return res.json([]);
      }
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/products', async (req, res) => {
  try {
    const db = await getDb();
    const payload = req.body;
    const r = await db.collection('products').insertOne(payload);
    res.status(201).json({ ...payload, _id: r.insertedId });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const db = await getDb();
    const id = req.params.id;
    await db.collection('products').updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const db = await getDb();
    const id = req.params.id;
    await db.collection('products').deleteOne({ _id: new ObjectId(id) });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Orders
app.get('/orders', async (req, res) => {
  try {
    const db = await getDb();
    const items = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/orders', async (req, res) => {
  try {
    const db = await getDb();
    const payload = { ...req.body, createdAt: new Date().toISOString() };
    const r = await db.collection('orders').insertOne(payload);
    res.status(201).json({ ...payload, _id: r.insertedId });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/orders/:id', async (req, res) => {
  try {
    const db = await getDb();
    const id = req.params.id;
    await db.collection('orders').updateOne({ _id: new ObjectId(id) }, { $set: req.body });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/orders/:id', async (req, res) => {
  try {
    const db = await getDb();
    const id = req.params.id;
    await db.collection('orders').deleteOne({ _id: new ObjectId(id) });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Admin tokens
app.post('/admin/token', async (req, res) => {
  try {
    const db = await getDb();
    const raw = (Math.random().toString(36).slice(2) + Date.now().toString(36));
    const doc = { token: raw, label: req.body.label || 'admin', createdAt: new Date().toISOString() };
    await db.collection('admin_tokens').insertOne(doc);
    res.status(201).json({ token: raw });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/admin/verify', async (req, res) => {
  try {
    const db = await getDb();
    const { token } = req.body;
    const found = await db.collection('admin_tokens').findOne({ token });
    if (!found) return res.status(403).json({ error: 'invalid' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

const port = process.env.BACKEND_PORT || 4000;
app.listen(port, () => console.log('Backend listening on port', port));
