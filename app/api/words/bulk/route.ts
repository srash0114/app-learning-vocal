import { NextRequest, NextResponse } from 'next/server';

interface RequestBody {
  words: string[];
}

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function callClaude(word: string): Promise<string> {
  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: `Tra nghĩa từ tiếng Anh: "${word}". Trả lời JSON không có markdown:
{"word":"${word}","phonetic":"/IPA/","type":"loại từ tiếng Việt","meaning":"nghĩa tiếng Việt","example":"ví dụ tiếng Anh","example_vi":"dịch tiếng Việt"}`,
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
      max_tokens: 600,
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
        const result = await callClaude(word);
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
