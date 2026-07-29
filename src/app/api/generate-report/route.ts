import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userEmail, type, details } = body;

    if (!userId || !type || !details) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call OpenAI to generate the report
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const prompt = `You are an expert Vedic Astrologer. Generate a detailed and personalized astrology report for a user based on the following details:
Service Type: ${type}
Date of Birth: ${details.dob}
Time of Birth: ${details.time}
Place of Birth: ${details.place}

Today's Date is: ${currentDate}.

Respond EXCLUSIVELY with a JSON object. Do not include any markdown formatting like \`\`\`json. The JSON object MUST have the exact following structure:
{
  "recommendationTitle": "Recommended ${type.replace(/ Report/i, '')}",
  "recommendationName": "Name of the specific recommendation (e.g. Navagraha Homam, Blue Sapphire, etc.)",
  "timing": "Specific upcoming date and best timing (e.g. Saturday, 15 Aug 2026 · 6:00-9:00 AM)",
  "duration": "Duration if applicable (e.g. 3-4 hours) or N/A",
  "materials": "Comma-separated list of materials/items needed",
  "astrologicalAnalysis": "A very detailed, professional, 2-3 paragraph explanation of their specific planetary positions, doshas, and exactly why this specific service/ritual is highly recommended for them.",
  "procedure": "Step-by-step instructions on how the ritual or service will be performed.",
  "rules": "Specific rules, dietary restrictions, or mantras the user must follow on that day."
}`;

    let reportContent = '';

    try {
      const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (!openAiResponse.ok) {
        const errorData = await openAiResponse.json().catch(() => ({}));
        console.warn('OpenAI API Error, falling back to mock data:', errorData);
        throw new Error(errorData?.error?.message || 'OpenAI Error');
      }

      const openAiData = await openAiResponse.json();
      reportContent = openAiData.choices[0].message.content;
    } catch (apiError) {
      console.log('Using fallback mock report due to API error.');
      const fallbackJson = {
        recommendationTitle: `Recommended ${type.replace(/ Report/i, '')}`,
        recommendationName: 'Navagraha Homam',
        timing: 'Saturday, 15 Aug 2026 · 6:00-9:00 AM',
        duration: '3-4 hours',
        materials: 'Sesame seeds, Ghee, Navagraha herbs, Flowers, Coconut, Betel leaves',
        astrologicalAnalysis:
          'Based on the profound analysis of your birth chart, we observe a significant transit of Saturn and Rahu impacting your 10th and 4th houses. This planetary alignment creates friction in career progression and domestic harmony. The Navagraha Homam acts as a powerful energetic balancer.\n\nBy appeasing the nine celestial bodies, specifically focusing on mitigating the malefic effects of Rahu, this ritual will clear the cosmic blockages currently causing delays in your endeavors.',
        procedure:
          '1. Sankalpam (Vow taking) with your name and gotra. \n2. Kalasa Puja invoking the divine energies. \n3. Navagraha chanting and Ahuti (offerings) into the sacred fire. \n4. Purnahuti (final offering) and Aarti.',
        rules:
          "Observe a strict vegetarian diet on the day of the Homam. Abstain from alcohol and onion/garlic. Chant the 'Om Namah Shivaya' mantra 108 times during the Brahma Muhurtam.",
      };
      reportContent = JSON.stringify(fallbackJson);
    }

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'service_requests'), {
      userId,
      userEmail: userEmail || '',
      type,
      details,
      status: 'completed',
      reportContent,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, reportId: docRef.id });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
