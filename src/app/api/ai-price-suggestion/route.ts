import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple in-memory rate limiter (max 20 requests per minute)
const requestTimestamps: number[] = [];

function isRateLimited() {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 60000) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= 20) {
    return true;
  }
  requestTimestamps.push(now);
  return false;
}

export async function POST(req: Request) {
  console.log('Using Gemini key ending in:', process.env.GEMINI_API_KEY?.slice(-6));
  try {
    const { cropName, category, province } = await req.json();

    if (!cropName || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isRateLimited()) {
      return NextResponse.json({
        minPrice: null,
        maxPrice: null,
        reasoning: "Unable to fetch AI suggestion right now (Rate Limit). Use your own judgment or check the Market page for similar listings.",
        fallback: true
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Given a Philippine agricultural crop called '${cropName}' in category '${category}', located in '${province || 'the Philippines'}', suggest a fair farm-gate price range per kilogram in Philippine pesos that is higher than typical middleman rates but still competitive for bulk buyers. 
      Respond ONLY with valid JSON in this exact format, no markdown formatting, no code blocks, no extra text:
      {
        "minPrice": number,
        "maxPrice": number,
        "reasoning": "1 sentence explanation"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse the Gemini response, strip any markdown code fences if present
    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
      
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Gemini API Error (AI Price Suggestion):', error);
    
    // Graceful fallback
    return NextResponse.json({
      minPrice: null,
      maxPrice: null,
      reasoning: "Our pricing AI is currently optimizing other requests. Based on historical trends, we recommend checking the Market page for competitive rates.",
      fallback: true
    });
  }
}
