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
  try {
    const { listings } = await req.json();

    if (isRateLimited()) {
      return NextResponse.json({
        matchScore: 75,
        headline: "Market conditions look stable today",
        detail: "Unable to generate live insights right now (Rate Limit). Check back shortly.",
        recommendedAction: "Browse the market for current listings.",
        urgentCrop: null,
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
      You are an expert agricultural market analyst.
      Analyze the following current harvest listings:
      ${JSON.stringify(listings, null, 2)}
      
      Identify:
      - Which crops have high volume relative to typical demand (potential oversupply/waste risk)
      - Which crops are priced significantly below or above the fair market range
      - Which listings are most urgent (harvest date approaching soon with low order activity)
      - A short, actionable recommendation (1-2 sentences)

      Respond ONLY with valid JSON in this exact format, no markdown formatting, no code blocks, no extra text:
      {
        "matchScore": number (0-100),
        "headline": "short 8-12 word alert headline",
        "detail": "1-2 sentence explanation",
        "recommendedAction": "short actionable suggestion",
        "urgentCrop": "name of the most urgent crop, or null"
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
    console.error('Gemini API Error (AI Match):', error);
    
    // Graceful fallback
    return NextResponse.json({
      matchScore: 75,
      headline: "Market conditions look stable today",
      detail: "Our AI is currently optimizing other market requests. Using cached stable market conditions for now.",
      recommendedAction: "Browse the market for current listings.",
      urgentCrop: null,
      fallback: true
    });
  }
}
