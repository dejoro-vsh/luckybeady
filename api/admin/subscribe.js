import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, action } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    // Ensure table exists
    await pool.sql`
      CREATE TABLE IF NOT EXISTS admins (
        user_id VARCHAR(100) PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    if (action === 'subscribe') {
      await pool.sql`
        INSERT INTO admins (user_id) 
        VALUES (${userId}) 
        ON CONFLICT (user_id) DO NOTHING
      `;
      return res.status(200).json({ success: true, message: 'Subscribed successfully' });
    } else if (action === 'unsubscribe') {
      await pool.sql`
        DELETE FROM admins WHERE user_id = ${userId}
      `;
      return res.status(200).json({ success: true, message: 'Unsubscribed successfully' });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('DB Error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
