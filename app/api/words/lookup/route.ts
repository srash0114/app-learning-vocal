import { NextRequest, NextResponse } from 'next/server';

interface RequestBody {
  word: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

async function callGrok(word: string): Promise<string> {
  const apiKey = process.env.XAI_API_KEY || '';
  
  if (!apiKey) {
    throw new Error('XAI_API_KEY is not set');
  }

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

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-2',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
    console.error('xAI Grok API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    });
    throw new Error(`xAI Grok API error: ${response.statusText}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content || '';
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

    const result = await callGrok(word);
    
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
