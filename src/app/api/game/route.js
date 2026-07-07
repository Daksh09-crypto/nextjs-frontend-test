import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function GET() {
  try {
    // 1. Establish a stable calendar date string seed
    const today = new Date();
    const dateString = today.toISOString().split("T")[0]; // Format: "2026-07-05"

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Missing Gemini API Engine deployment configurations." },
        { status: 500 }
      );
    }

    // 2. Draft an explicit system instruction enforcing your strict layout configuration
    const systemPrompt = `
      You are an advanced linguistic testing system. Generate exactly 5 multiple-choice English grammar or vocabulary questions.
      The questions must scale in difficulty: 2 Easy, 2 Medium, and 1 Hard.
      
      You MUST respond with a raw JSON object matching this structure exactly. Do not wrap the JSON in markdown code blocks like \`\`\`json.
      
      Expected JSON Format:
      {
        "questions": [
          {
            "id": 1,
            "level": "easy",
            "question": "Clear, contextual question text goes here...",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option A",
            "explanation": "Detailed explanation matching the correct answer choice."
          }
        ]
      }
      
      Crucial Constraints:
      - The 'answer' string MUST match one of your strings inside the 'options' array exactly.
      - Keep options down to exactly 4 items per question.
      - Seed context baseline: Use the calendar parameter marker "${dateString}" to generate topics so the pool remains stable for the day.
    `;

    // 3. Dispatch the streaming context payload down to Google Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json" // Tells Gemini to natively structure outputs as JSON
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini Response Failure:", errorText);
      return NextResponse.json({ success: false, message: "Gemini execution pipeline dropped." }, { status: 502 });
    }

    const rawData = await response.json();
    const rawJsonText = rawData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawJsonText) {
      throw new Error("Empty token chunk returned from AI interface cluster.");
    }

    // 4. Parse Gemini's structured response string into a clean JS Object array
    const parsedData = JSON.parse(rawJsonText);
    let dailyQuizSet = parsedData.questions || [];

    // 5. Ensure the structure scales sequentially (Easy -> Medium -> Hard) before dispatching to client UI
    const orderWeights = { easy: 1, medium: 2, hard: 3 };
    dailyQuizSet.sort((a, b) => (orderWeights[a.level] || 1) - (orderWeights[b.level] || 1));

    // 6. Force Next.js to cache this route for 24 hours so we don't hit the API rate limits on every page refresh!
    return NextResponse.json(
      {
        success: true,
        date: dateString,
        questions: dailyQuizSet.slice(0, 5) // Safely bound array cap parameters to 5 total items
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
        }
      }
    );

  } catch (error) {
    console.error("Linguist AI Game Engine Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed parsing day parameters for quiz collection.",
        error: error.message
      },
      { status: 500 }
    );
  }
}