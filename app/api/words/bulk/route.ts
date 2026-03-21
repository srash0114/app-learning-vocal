import { NextRequest, NextResponse } from 'next/server';
import { getNextApiKey } from '@/lib/gemini-keys';

interface RequestBody {
  words: string[];
}

async function callGemini(word: string): Promise<string> {
  const apiKey = await getNextApiKey();
  const prompt = `Tra nghĩa từ tiếng Anh: "${word}". Trả lời JSON không có markdown:
{"word":"${word}","phonetic":"/IPA/","type":"loại từ tiếng Việt","meaning":"nghĩa tiếng Việt","example":"ví dụ tiếng Anh","example_vi":"dịch tiếng Việt"}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 600,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
    console.error('Gemini API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    });
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const { words } = body;

    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: 'Words array is required' },
        { status: 400 }
      );
    }

    const results = [];
    for (const word of words) {
      try {
        const result = await callGemini(word);
        const cleaned = result.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        results.push({ success: true, data: parsed });
      } catch (error) {
        console.error(`Error looking up "${word}":`, error);
        results.push({ success: false, word, error: 'Failed to lookup' });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in bulk lookup:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk lookup' },
      { status: 500 }
    );
  }
}
