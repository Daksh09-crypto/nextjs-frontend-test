export async function POST(request) {
  try {
    const { word, targetLanguage } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json({ success: false, message: "API Configuration missing." });
    }

    const prompt = `
      Act as an advanced computational linguist and cultural expert specializing in English, Hindi, and Sanskrit.
      Analyze the input text: "${word}". It can be a word, phrase, or sentence.

      Your target explanation/translation language is: "${targetLanguage}".

      Perform these tasks:
      1. If the input is pure keyboard-smash nonsense, return {"success": false}.
      2. Check for any grammar mistakes or spelling typos in the input text. Capture them in the "errorAnalysis" object.
      3. In the "grammarSection" field, provide very short may not exceed 100 words understandable  technical grammar rules.provide relevant IDIOMS, PROVERBS (Muhavare/Lokoktiyan), or METAPHORS related to the input text or its theme each of them should have indicator and marked heading if possible arranged in different paragraphs . Explain their meaning and cultural context clearly in "${targetLanguage}". If the input text itself is an idiom, break down its deeper metaphorical meaning.
      4. Provide translations, meanings, easy vs advanced examples, and synonyms directly adjusted for the target explanation language ("${targetLanguage}").
      5. Provide phonetic pronunciations of the input text for all three languages.

      Output a single clean JSON object matching this structure exactly. Do not wrap in markdown or code fences.

      {
        {
  "word": "${word}",
  "errorAnalysis": {
    "hasErrors": true,
    "correction": "Corrected version of the text if errors exist, otherwise null",
    "explanation": "Brief explanation of what was wrong in ${targetLanguage}, or null"
  },
  "pronunciations": {
    "english": "Phonetic pronunciation guide for English speakers",
    "hindi": "Pronunciation or Devnagari guide for Hindi speakers",
    "sanskrit": "Pronunciation guide using standard transliteration (IAST)"
  },
  "grammarSection": {
    "grammarInsight": "A very short, accurate breakdown of technical grammar rules used in the input text, written clearly in ${targetLanguage} (Strict maximum: 100 words).",
    "idiom": {
      "expression": "One relevant idiom or proverb (Muhavara/Lokokti) matching the theme or input text",
      "meaning": "An understandable, short explanation of its meaning and cultural context in ${targetLanguage}"
    },
    "metaphor": {
      "expression": "One relevant metaphorical expression matching the theme or input text",
      "meaning": "An understandable, short explanation of its deeper metaphorical meaning in ${targetLanguage}"
    }
  },
  "meanings": [
    {
      "partOfSpeech": "Noun / Verb / Phrase etc",
      "definitions": [
        {
          "definition": "Deep core definition/translation in ${targetLanguage}",
          "easyExample": "An easy, everyday conversational example sentence using this concept",
          "advancedExample": "A high-level, advanced, literary or professional example sentence using this concept"
        }
      ],
      "synonyms": {
        "easy": ["simple_synonym1", "simple_synonym2"],
        "advanced": ["complex_synonym1", "complex_synonym2"]
      }
    }
  ]
}
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );

    if (!response.ok) {
      return Response.json({ success: false, message: "Linguistic engine offline." });
    }

    const aiData = await response.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
     
    const parsedData = JSON.parse(rawText.trim());

    if (parsedData.success === false) {
      return Response.json({ success: false, message: "Text could not be analyzed." });
    }

    return Response.json(parsedData);

  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: "Server error occurred." }, { status: 500 });
  }
}