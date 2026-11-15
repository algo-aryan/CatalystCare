import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getSarvamApiKey(): string | undefined {
  if (process.env.SARVAM_API_KEY?.trim()) {
    return process.env.SARVAM_API_KEY.trim();
  }
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('SARVAM_API_KEY=')) {
          return trimmed.substring('SARVAM_API_KEY='.length).trim();
        }
      }
    }
  } catch (e) {
    console.warn('[Sarvam AI] Error reading .env.local fallback:', e);
  }
  return undefined;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, language = 'hi-IN', speaker = 'priya' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const sarvamApiKey = getSarvamApiKey();
    const targetLang = language.toLowerCase().startsWith('en') ? 'en-IN' : 'hi-IN';
    const truncatedText = text.length > 450 ? text.substring(0, 450) : text;

    if (sarvamApiKey) {
      try {
        const response = await fetch('https://api.sarvam.ai/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': sarvamApiKey,
          },
          body: JSON.stringify({
            inputs: [truncatedText],
            target_language_code: targetLang,
            speaker: speaker || 'priya', // 'priya', 'aditya', 'pooja'
            pitch: 0,
            pace: 0.85,
            loudness: 1.5,
            speech_sample_rate: 16000,
            enable_preprocessing: true,
            model: 'bulbul:v3',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.audios && data.audios[0]) {
            return NextResponse.json({
              success: true,
              engine: 'SARVAM_AI',
              speaker: 'priya',
              audioDataUrl: `data:audio/wav;base64,${data.audios[0]}`,
            });
          }
        } else {
          const errText = await response.text();
          console.warn('[Sarvam AI] API error:', response.status, errText);
        }
      } catch (err) {
        console.warn('[Sarvam AI] Fetch error:', err);
      }
    }

    return NextResponse.json({
      success: false,
      fallback: true,
      engine: 'FALLBACK',
      message: 'Sarvam AI key unavailable or network error.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
