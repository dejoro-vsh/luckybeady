import { createPool } from '@vercel/postgres';
import { put } from '@vercel/blob';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.sql`SELECT * FROM products ORDER BY type, name`;
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { id, name, type, color, price, size, img, meaning, stock_quantity, imageBase64 } = req.body;
      
      let finalImgUrl = img || '';
      if (imageBase64) {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = await put(`products/${id}-${Date.now()}.jpg`, buffer, { access: 'public' });
        finalImgUrl = blob.url;
      }

      await pool.sql`
        INSERT INTO products (id, name, type, color, price, size, img, meaning, stock_quantity)
        VALUES (${id}, ${name}, ${type}, ${color}, ${price}, ${size}, ${finalImgUrl}, ${meaning}, ${stock_quantity || 0})
      `;
      return res.status(201).json({ success: true, img: finalImgUrl });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, name, type, color, price, size, img, meaning, stock_quantity, imageBase64 } = req.body;
      
      let finalImgUrl = img || '';
      if (imageBase64) {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = await put(`products/${id}-${Date.now()}.jpg`, buffer, { access: 'public' });
        finalImgUrl = blob.url;
      }

      await pool.sql`
        UPDATE products 
        SET name=${name}, type=${type}, color=${color}, price=${price}, size=${size}, img=${finalImgUrl}, meaning=${meaning}, stock_quantity=${stock_quantity}
        WHERE id=${id}
      `;
      return res.status(200).json({ success: true, img: finalImgUrl });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await pool.sql`DELETE FROM products WHERE id=${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
