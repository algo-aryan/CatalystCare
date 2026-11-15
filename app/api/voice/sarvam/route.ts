import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, language = 'hi-IN', speaker = 'meera' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const sarvamApiKey = process.env.SARVAM_API_KEY?.trim();
    const targetLang = language.toLowerCase().startsWith('en') ? 'en-IN' : 'hi-IN';
    const truncatedText = text.length > 450 ? text.substring(0, 450) : text;

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
            inputs: [truncatedText],
            target_language_code: targetLang,
            speaker: speaker, // 'meera', 'arvind'
            pitch: 0,
            pace: 0.85,
            loudness: 1.5,
            speech_sample_rate: 16000,
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
          const errorText = await response.text();
          console.warn('[Sarvam AI] API returned status:', response.status, errorText);
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
      message: 'Using client-side Indic voice synthesis.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
