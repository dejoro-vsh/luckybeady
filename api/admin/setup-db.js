import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL
});

const initialStones = [
  { id: 's1', name: 'Strawberry Quartz', type: 'stone', color: 'pink', price: 65, sizes: [4, 6, 8], img: 'https://via.placeholder.com/150/FFB6C1', meaning: 'ช่วยเสริมเสน่ห์ ความรัก และความเมตตา' },
  { id: 's2', name: 'Rose Quartz Madagascar Dark', type: 'stone', color: 'pink', price: 97, sizes: [4, 6, 8], img: 'https://via.placeholder.com/150/FFC0CB', meaning: 'เสริมดวงความรัก นำพามิตรภาพดีๆ' },
  { id: 's3', name: 'Aquamarine (Blue Sky)', type: 'stone', color: 'blue', price: 113, sizes: [4, 6, 8], img: 'https://via.placeholder.com/150/87CEEB', meaning: 'นำพาความสงบ ลดความเครียด คุ้มครองในการเดินทาง' },
  { id: 's4', name: 'Aquamarine (Milky)', type: 'stone', color: 'blue', price: 95, sizes: [4, 6, 8], img: 'https://via.placeholder.com/150/E0FFFF', meaning: 'ช่วยให้ใจเย็น สื่อสารอย่างมีประสิทธิภาพ' },
  { id: 's5', name: 'Blue Lace Agate', type: 'stone', color: 'blue', price: 99, sizes: [4, 6, 8], img: 'https://via.placeholder.com/150/ADD8E6', meaning: 'เสริมความมั่นใจ ลดความวิตกกังวล' },
  { id: 's6', name: 'Silver Obsidian', type: 'stone', color: 'black', price: 66, sizes: [4, 6, 8], img: 'https://via.placeholder.com/150/2F4F4F', meaning: 'ปกป้องคุ้มครองจากพลังงานลบ' },
  { id: 's7', name: 'Eagle Eye', type: 'stone', color: 'black', price: 68, sizes: [4, 6, 8], img: 'https://via.placeholder.com/150/4B0082', meaning: 'เสริมวิสัยทัศน์ ความเด็ดขาด และความเป็นผู้นำ' },
  { id: 's8', name: 'Carnelian', type: 'stone', color: 'yellow', price: 41, sizes: [4, 6, 8], img: 'https://via.placeholder.com/150/FF7F50', meaning: 'กระตุ้นพลังงาน ความกล้าหาญ และความคิดสร้างสรรค์' },
  { id: 's9', name: 'Amethyst', type: 'stone', color: 'pink', price: 59, sizes: [4, 6, 8], img: 'https://via.placeholder.com/150/9966CC', meaning: 'บำบัดจิตใจ ให้นอนหลับสบาย และเสริมสติปัญญา' },
  { id: 'sp1', name: 'LUNA Spacer Silver', type: 'spacer', color: 'silver', price: 790, sizes: [4, 6, 8], img: 'https://via.placeholder.com/150/C0C0C0', meaning: '' },
  { id: 'sp2', name: 'LUNA Spacer Pinkgold', type: 'spacer', color: 'pinkgold', price: 890, sizes: [4, 6, 8], img: 'https://via.placeholder.com/150/FFB6C1', meaning: '' },
  { id: 'c1', name: 'LUNA Heart Silver', type: 'charm', color: 'silver', price: 1690, sizes: [], img: 'https://via.placeholder.com/150/C0C0C0', meaning: '' }
];

export default async function handler(req, res) {
  // Add a safety check in production, but for now we allow resetting
  const { reset } = req.query;

  try {
    if (reset === 'true') {
      await pool.sql`DROP TABLE IF EXISTS products`;
    }

    // 1. Create table if not exists
    await pool.sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        color VARCHAR(50),
        price NUMERIC NOT NULL,
        size NUMERIC,
        img VARCHAR(255),
        meaning TEXT,
        stock_quantity INTEGER DEFAULT 0
      );
    `;

    // 2. Check if data exists
    const { rows } = await pool.sql`SELECT count(*) FROM products`;
    const count = parseInt(rows[0].count);

    if (count === 0) {
      // Seed data (Optional, we can skip it or just add some examples)
      // I'll keep the initial loop but adapt to new schema if needed. 
      // But actually, letting the user add them manually via the new Admin UI is better.
      return res.status(200).json({ message: "Table created and ready. You can now add products via Admin.", count: 0 });
    }

    return res.status(200).json({ message: "Table already exists and has data", count });
  } catch (error) {
    console.error("Error setting up DB:", error);
    return res.status(500).json({ error: error.message });
  }
}
