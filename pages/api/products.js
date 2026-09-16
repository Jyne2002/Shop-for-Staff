import clientPromise from '../../lib/mongodb';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../../lib/shopData';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();
  const col = db.collection('products');

  if (req.method === 'GET') {
    const items = await col.find({}).toArray();
    if (!items.length) {
      await col.insertMany(DEFAULT_PRODUCTS.map(p => ({ ...p })));
      const seeded = await col.find({}).toArray();
      return res.status(200).json(seeded);
    }
    return res.status(200).json(items);
  }

  if (req.method === 'POST') {
    const payload = req.body;
    const result = await col.insertOne(payload);
    return res.status(201).json({ ...payload, _id: result.insertedId });
  }

  if (req.method === 'PUT') {
    const { id, ...patch } = req.body;
    if (!id) return res.status(400).json({ error: 'missing id' });
    await col.updateOne({ _id: new ObjectId(id) }, { $set: patch });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'missing id' });
    await col.deleteOne({ _id: new ObjectId(id) });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end();
}
