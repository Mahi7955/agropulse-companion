import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cropType, growthStage, weather, mandiPrices, question } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('AI Advisor request:', { cropType, growthStage, question });

    // Build context from farm data
    let context = `You are an expert agricultural advisor helping Indian farmers. Provide practical, actionable advice in simple language.

Current Farm Data:
- Crop: ${cropType || 'Not specified'}
- Growth Stage: ${growthStage || 'Not specified'}`;

    if (weather) {
      context += `
- Weather: ${weather.description}, Temperature: ${weather.temperature}°C, Humidity: ${weather.humidity}%, Rainfall: ${weather.rainfall}mm`;
    }

    if (mandiPrices) {
      context += `
- Current Market Price: ₹${mandiPrices.modalPrice}/quintal at ${mandiPrices.market}`;
    }

    const userPrompt = question || 'Based on my current farm data, what should I do today? Provide irrigation, fertilizer, and selling recommendations.';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: context + '\n\nFarmer Question: ' + userPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response received');

    const advice = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      'Unable to generate advice at this time. Please try again.';

    return new Response(JSON.stringify({ 
      advice,
      context: {
        cropType,
        growthStage,
        temperature: weather?.temperature,
        humidity: weather?.humidity,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-advisor function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
