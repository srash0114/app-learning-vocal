import { NextRequest, NextResponse } from 'next/server';

interface RequestBody {
  word: string;
}

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function callClaude(word: string): Promise<string> {
  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: `Tra nghĩa từ tiếng Anh: "${word}"
Trả lời CHÍNH XÁC theo JSON sau (không có markdown, không giải thích thêm):
{
  "word": "${word}",
  "phonetic": "/phiên âm IPA/",
  "type": "loại từ bằng tiếng Việt (danh từ/động từ/tính từ...)",
  "meaning": "nghĩa chính bằng tiếng Việt (ngắn gọn, 1-2 nghĩa)",
  "example": "1 câu ví dụ tiếng Anh tự nhiên",
  "example_vi": "dịch câu ví dụ ra tiếng Việt"
}`,
    },
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json() as { content?: Array<{ text?: string }> };
  const text = data.content?.[0]?.text || '';
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

    const result = await callClaude(word);
    
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
