import clientPromise from '../../lib/mongodb';
import { randomBytes } from 'crypto';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();
  const col = db.collection('admin_tokens');

  if (req.method === 'GET') {
    const items = await col.find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json(items.map(({ token, ...rest }) => rest));
  }

  if (req.method === 'POST') {
    // create token
    const { label } = req.body || {};
    const raw = randomBytes(16).toString('hex');
    const doc = { token: raw, label: label || 'admin', createdAt: new Date().toISOString() };
    await col.insertOne(doc);
    return res.status(201).json({ token: raw });
  }

  if (req.method === 'PUT') {
    // verify token
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: 'missing token' });
    const found = await col.findOne({ token });
    if (!found) return res.status(403).json({ error: 'invalid token' });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT']);
  res.status(405).end();
}
