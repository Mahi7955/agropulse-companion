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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
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

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lovable AI response received');

    const advice = data.choices?.[0]?.message?.content || 
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
