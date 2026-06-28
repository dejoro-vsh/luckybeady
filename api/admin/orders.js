import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if table exists
    const { rows: tables } = await pool.sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
      );
    `;
    
    if (!tables[0].exists) {
      return res.status(200).json([]);
    }

    const { rows } = await pool.sql`
      SELECT * FROM orders 
      ORDER BY created_at DESC
    `;

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Fetch orders error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
