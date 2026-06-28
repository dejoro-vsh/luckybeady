import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, color, type } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing in Vercel settings.' });
    }

    let prompt = `ช่วยเขียนความหมายหรือสรรพคุณสั้นๆ (ไม่เกิน 2-3 บรรทัด) สำหรับเครื่องประดับ: ชื่อ ${name}`;
    if (color) prompt += ` สี ${color}`;
    if (type === 'stone') prompt += ` (ซึ่งเป็นหินมงคล)`;
    prompt += ` เขียนให้อ่านแล้วรู้สึกเป็นมงคล พลังบวก น่าสวมใส่ ไม่ต้องมีคำเกริ่นนำ`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    return res.status(200).json({ meaning: text.trim() });
    
  } catch (error) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
