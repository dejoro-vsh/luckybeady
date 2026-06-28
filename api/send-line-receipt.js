export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, orderData } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Missing LINE token in server' });
  }

  const { ownerName, wristSize, stoneSize, braceletConfig, totalPrice } = orderData;
  const discountedPrice = Math.floor(totalPrice * 0.8);
  const beadCount = braceletConfig.filter(i => i !== null).length;

  const flexMessage = {
    type: "flex",
    altText: "ใบเสร็จรับเงินจาก LuckyBeady",
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "LuckyBeady By YU",
            weight: "bold",
            color: "#ffffff",
            size: "md"
          },
          {
            type: "text",
            text: "RECEIPT / ใบเสร็จรับเงิน",
            color: "#ffffffcc",
            size: "xs",
            margin: "sm"
          }
        ],
        backgroundColor: "#1e293b",
        paddingAll: "20px"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: `สำหรับ: ${ownerName || 'ลูกค้า'}`,
            weight: "bold",
            size: "sm",
            margin: "md"
          },
          {
            type: "text",
            text: `ข้อมือ ${wristSize} cm | หิน ${stoneSize} mm | รวม ${beadCount} เม็ด`,
            size: "xs",
            color: "#64748b",
            margin: "sm",
            wrap: true
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "ยอดชำระสุทธิ",
                size: "sm",
                color: "#64748b"
              },
              {
                type: "text",
                text: `฿${discountedPrice.toLocaleString()}`,
                size: "lg",
                color: "#10b981",
                weight: "bold",
                align: "end"
              }
            ],
            margin: "lg"
          },
          {
            type: "text",
            text: "✅ ชำระเงินเรียบร้อยแล้ว",
            color: "#10b981",
            size: "xs",
            align: "center",
            margin: "xl",
            weight: "bold"
          },
          {
            type: "text",
            text: "ทางร้านจะจัดทำและจัดส่งให้โดยเร็วที่สุดครับ",
            size: "xxs",
            color: "#94a3b8",
            align: "center",
            margin: "sm",
            wrap: true
          }
        ]
      }
    }
  };

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        to: userId,
        messages: [flexMessage]
      })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("LINE API Error:", result);
      return res.status(response.status).json({ error: result.message || 'Failed to send LINE message' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Fetch Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
