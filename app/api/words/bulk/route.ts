import { NextRequest, NextResponse } from 'next/server';

interface RequestBody {
  words: string[];
}

async function callGrok(word: string): Promise<string> {
  const apiKey = process.env.XAI_API_KEY || '';
  
  if (!apiKey) {
    throw new Error('XAI_API_KEY is not set');
  }

  const prompt = `Tra nghĩa từ tiếng Anh: "${word}". Trả lời JSON không có markdown:
{"word":"${word}","phonetic":"/IPA/","type":"loại từ tiếng Việt","meaning":"nghĩa tiếng Việt","example":"ví dụ tiếng Anh","example_vi":"dịch tiếng Việt"}`;

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
      max_tokens: 600,
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
        const result = await callGrok(word);
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
