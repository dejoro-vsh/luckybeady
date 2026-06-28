import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Simple auth check can be added here using headers (e.g. Bearer token)
  // For simplicity, we are skipping robust auth for this example, but in production, ensure this route is protected.
  
  if (req.method === 'GET') {
    try {
      // Get all products (admin views all, even out of stock)
      const { rows } = await sql`SELECT * FROM products ORDER BY type, name`;
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { id, name, type, color, price, sizes, img, meaning, stock_status } = req.body;
      await sql`
        INSERT INTO products (id, name, type, color, price, sizes, img, meaning, stock_status)
        VALUES (${id}, ${name}, ${type}, ${color}, ${price}, ${JSON.stringify(sizes)}, ${img}, ${meaning}, ${stock_status || 'in_stock'})
      `;
      return res.status(201).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, name, type, color, price, sizes, img, meaning, stock_status } = req.body;
      await sql`
        UPDATE products 
        SET name=${name}, type=${type}, color=${color}, price=${price}, sizes=${JSON.stringify(sizes)}, img=${img}, meaning=${meaning}, stock_status=${stock_status}
        WHERE id=${id}
      `;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query; // e.g. /api/admin/products?id=s1
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await sql`DELETE FROM products WHERE id=${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
