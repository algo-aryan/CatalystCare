import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, language = 'hi-IN', speaker = 'meera' } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const sarvamApiKey = process.env.SARVAM_API_KEY;

    // If Sarvam AI API Key is provided, call Sarvam AI Indic Bulbul TTS
    if (sarvamApiKey) {
      try {
        const response = await fetch('https://api.sarvam.ai/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': sarvamApiKey,
          },
          body: JSON.stringify({
            inputs: [text],
            target_language_code: language,
            speaker: speaker, // 'meera', 'arvind', 'amartya', 'ananya'
            pitch: 0,
            pace: 0.82, // Slower pace for elderly comprehension
            loudness: 1.5,
            speech_sample_rate: 8000,
            enable_preprocessing: true,
            model: 'bulbul:v1',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.audios && data.audios[0]) {
            return NextResponse.json({
              success: true,
              engine: 'SARVAM_AI',
              speaker,
              audioDataUrl: `data:audio/wav;base64,${data.audios[0]}`,
            });
          }
        } else {
          console.warn('[Sarvam AI] API returned status:', response.status);
        }
      } catch (err) {
        console.warn('[Sarvam AI] Network fetch failed, falling back to client-side speech:', err);
      }
    }

    // Graceful fallback to client Web Speech API when key is absent or network fails
    return NextResponse.json({
      success: false,
      fallback: true,
      engine: 'WEB_SPEECH_INDIC_FALLBACK',
      message: 'Sarvam AI key not configured or unreachable; using client-side Indic voice synthesis.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
