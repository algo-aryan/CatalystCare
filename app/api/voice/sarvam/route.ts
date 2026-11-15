import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, language = 'hi-IN', speaker = 'priya' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const sarvamApiKey = process.env.SARVAM_API_KEY?.trim();
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
            speaker: speaker || 'priya', // 'priya', 'aditya', 'pooja', 'neha'
            pitch: 0,
            pace: 0.85, // Slower, relaxed pace for elders
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
          console.warn('[Sarvam AI] API returned status:', response.status, errText);
        }
      } catch (err) {
        console.warn('[Sarvam AI] Network fetch failed, falling back to client voice:', err);
      }
    }

    // Fallback indicator
    return NextResponse.json({
      success: false,
      fallback: true,
      engine: 'WEB_SPEECH_INDIC_FALLBACK',
      message: 'Using client-side voice synthesis.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
