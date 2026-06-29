import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, orderData } = req.body;
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!channelAccessToken) {
    return res.status(500).json({ error: 'LINE_CHANNEL_ACCESS_TOKEN is not configured' });
  }

  try {
    const discountedPrice = Math.floor(orderData.totalPrice * 0.8);
    const dateStr = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Group items for receipt
    const bomMap = new Map();
    (orderData.braceletConfig || []).forEach(item => {
      if (!item) return;
      if (bomMap.has(item.id)) {
        bomMap.get(item.id).qty += 1;
        bomMap.get(item.id).subtotal += Number(item.price);
      } else {
        bomMap.set(item.id, { ...item, qty: 1, subtotal: Number(item.price) });
      }
    });
    const bomList = Array.from(bomMap.values());
    const bomJson = JSON.stringify(bomList);

    // 1. SAVE ORDER TO DATABASE
    let orderId = null;
    try {
      await pool.sql`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(100),
          owner_name VARCHAR(100),
          wrist_size VARCHAR(20),
          total_price INTEGER,
          discounted_price INTEGER,
          bom_json TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await pool.sql`
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS bracelet_config TEXT;
      `;

      const braceletJson = JSON.stringify(orderData.braceletConfig || []);

      const result = await pool.sql`
        INSERT INTO orders (user_id, owner_name, wrist_size, total_price, discounted_price, bom_json, bracelet_config)
        VALUES (${userId || 'Anonymous'}, ${orderData.ownerName || '-'}, ${orderData.wristSize}, ${orderData.totalPrice}, ${discountedPrice}, ${bomJson}, ${braceletJson})
        RETURNING id
      `;
      orderId = result.rows[0].id;
    } catch (dbErr) {
      console.error('Failed to save order to DB:', dbErr);
      // We don't block the LINE notification if DB fails, but we log it.
    }

    // 2. BUILD FLEX MESSAGE
    const flexContents = {
      type: "bubble",
      size: "giga",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "LuckyBeady By YU", weight: "bold", size: "xl", color: "#ffffff" },
          { type: "text", text: `สรุปคำสั่งซื้อ #${orderId || '-'}`, color: "#ffffffcc", size: "sm" }
        ],
        backgroundColor: "#0f172a",
        paddingAll: "20px"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box", layout: "horizontal",
            contents: [
              { type: "text", text: "ชื่อลูกค้า", size: "sm", color: "#555555", flex: 1 },
              { type: "text", text: orderData.ownerName || "-", size: "sm", color: "#111111", align: "end", flex: 2 }
            ]
          },
          {
            type: "box", layout: "horizontal",
            contents: [
              { type: "text", text: "ขนาดข้อมือ", size: "sm", color: "#555555", flex: 1 },
              { type: "text", text: `${orderData.wristSize} cm`, size: "sm", color: "#111111", align: "end", flex: 1 }
            ], margin: "md"
          },
          { type: "separator", margin: "xxl" },
          { type: "text", text: "รายการสินค้า", weight: "bold", margin: "lg", size: "sm" },
          ...bomList.map(item => ({
            type: "box", layout: "horizontal",
            contents: [
              { type: "text", text: `${item.name} x${item.qty}`, size: "sm", color: "#555555", flex: 2, wrap: true },
              { type: "text", text: `฿${item.subtotal}`, size: "sm", color: "#111111", align: "end", flex: 1 }
            ], margin: "sm"
          })),
          { type: "separator", margin: "xxl" },
          {
            type: "box", layout: "horizontal", margin: "lg",
            contents: [
              { type: "text", text: "ยอดรวม", size: "sm", color: "#555555" },
              { type: "text", text: `฿${orderData.totalPrice}`, size: "sm", color: "#111111", align: "end", decoration: "line-through" }
            ]
          },
          {
            type: "box", layout: "horizontal", margin: "md",
            contents: [
              { type: "text", text: "ยอดสุทธิ (ลด 20%)", size: "md", color: "#10b981", weight: "bold" },
              { type: "text", text: `฿${discountedPrice}`, size: "lg", color: "#10b981", weight: "bold", align: "end" }
            ]
          }
        ]
      }
    };

    const messages = [{ type: "flex", altText: "สรุปออเดอร์จาก LuckyBeady", contents: flexContents }];

    let meaningText = "💎 ความหมายหินในกำไลของคุณ:\n";
    let hasMeaning = false;
    bomList.forEach(item => {
      if (item.meaning && item.type === 'stone') {
        meaningText += `\n✨ ${item.name}: ${item.meaning}`;
        hasMeaning = true;
      }
    });

    if (hasMeaning) {
      messages.push({ type: "text", text: meaningText });
    }

    const pushUrl = 'https://api.line.me/v2/bot/message/push';
    let lineResultCustomer = null;
    let lineResultAdmin = null;

    // 3. SEND TO CUSTOMER
    if (userId) {
      const custRes = await fetch(pushUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${channelAccessToken}` },
        body: JSON.stringify({ to: userId, messages: messages })
      });
      lineResultCustomer = { 
        response: await custRes.json(), 
        status: custRes.status, 
        attemptedUserId: userId 
      };
    } else {
      lineResultCustomer = { error: 'No userId provided' };
    }

    // 4. ALERT ADMINS
    try {
      const { rows } = await pool.sql`SELECT user_id FROM admins`;
      const adminIds = rows.map(r => r.user_id);
      
      if (adminIds.length > 0) {
        const adminMessage = {
          type: "text",
          text: `🚨 [ออเดอร์ใหม่ #${orderId || '-'}]\nชื่อลูกค้า: ${orderData.ownerName || '-'}\nข้อมือ: ${orderData.wristSize}cm\nยอดชำระ: ฿${discountedPrice}\nวันที่: ${dateStr}\n\n(คุณสามารถแชทคุยกับลูกค้าต่อในนี้ได้เลย)`
        };

        const admRes = await fetch('https://api.line.me/v2/bot/message/multicast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${channelAccessToken}` },
          body: JSON.stringify({
            to: adminIds,
            messages: [adminMessage, messages[0]]
          })
        });
        lineResultAdmin = {
          response: await admRes.json(),
          status: admRes.status,
          attemptedAdminIds: adminIds
        };
      } else {
        lineResultAdmin = { error: 'No admins found in database' };
      }
    } catch (adminErr) {
      lineResultAdmin = { error: adminErr.message };
    }

    // 5. UPDATE LOGS IN DATABASE
    if (orderId) {
      try {
        await pool.sql`
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_log TEXT;
        `;
        await pool.sql`
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_log TEXT;
        `;
        
        await pool.sql`
          UPDATE orders 
          SET customer_log = ${JSON.stringify(lineResultCustomer)},
              admin_log = ${JSON.stringify(lineResultAdmin)}
          WHERE id = ${orderId}
        `;
      } catch (logErr) {
        console.error('Failed to update logs in DB:', logErr);
      }
    }

    return res.status(200).json({ 
      success: true, 
      orderId, 
      lineResultCustomer, 
      lineResultAdmin 
    });

  } catch (err) {
    console.error('Send LINE error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
