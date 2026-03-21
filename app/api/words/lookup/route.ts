import { NextRequest, NextResponse } from 'next/server';
import { getNextApiKey } from '@/lib/gemini-keys';

interface RequestBody {
  word: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

async function callGemini(word: string): Promise<string> {
  const apiKey = await getNextApiKey();
  const prompt = `Tra nghĩa từ tiếng Anh: "${word}"
Trả lời CHÍNH XÁC theo JSON sau (không có markdown, không giải thích thêm):
{
  "word": "${word}",
  "phonetic": "/phiên âm IPA/",
  "type": "loại từ bằng tiếng Việt (danh từ/động từ/tính từ...)",
  "meaning": "nghĩa chính bằng tiếng Việt (ngắn gọn, 1-2 nghĩa)",
  "example": "1 câu ví dụ tiếng Anh tự nhiên",
  "example_vi": "dịch câu ví dụ ra tiếng Việt"
}`;

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
          maxOutputTokens: 1000,
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
    const { word } = body;

    if (!word || typeof word !== 'string') {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      );
    }

    const result = await callGemini(word);
    
    // Clean markdown formatting if present
    const cleaned = result.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error in word lookup:', error);
    return NextResponse.json(
      { error: 'Failed to lookup word' },
      { status: 500 }
    );
  }
}
