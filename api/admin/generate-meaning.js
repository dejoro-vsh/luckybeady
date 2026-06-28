export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, color, type } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing in Vercel settings.' });
    }

    let prompt = `ช่วยเขียนความหมายหรือสรรพคุณสั้นๆ (ไม่เกิน 2-3 บรรทัด) สำหรับเครื่องประดับ: ชื่อ ${name}`;
    if (color) prompt += ` สี ${color}`;
    if (type === 'stone') prompt += ` (ซึ่งเป็นหินมงคล)`;
    prompt += ` เขียนให้อ่านแล้วรู้สึกเป็นมงคล พลังบวก น่าสวมใส่ ไม่ต้องมีคำเกริ่นนำ`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      throw new Error(`Gemini API error: ${errData}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return res.status(200).json({ meaning: text.trim() });
    
  } catch (error) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
