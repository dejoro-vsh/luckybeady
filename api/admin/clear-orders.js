import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL
});

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await pool.sql`TRUNCATE TABLE orders;`;
    return res.status(200).json({ success: true, message: 'All orders cleared' });
  } catch (err) {
    console.error('Failed to clear orders:', err);
    return res.status(500).json({ error: 'Failed to clear orders', details: err.message });
  }
}
