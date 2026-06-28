import { createPool } from '@vercel/postgres';
const pool = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Only fetch items that have stock for the storefront
      const { rows } = await pool.sql`SELECT * FROM products WHERE stock_quantity > 0 ORDER BY type, name`;
      return res.status(200).json(rows);
    } catch (error) {
      console.error("Fetch Products Error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
