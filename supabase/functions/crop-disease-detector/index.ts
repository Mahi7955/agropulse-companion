import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, cropType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert agricultural plant pathologist specializing in crop disease identification. 
Analyze the provided crop image and identify any diseases, pests, or health issues.

Respond ONLY with a valid JSON object in this exact format:
{
  "diseaseDetected": true or false,
  "diseaseName": "Name of the disease or 'Healthy' if no disease",
  "severity": "Mild", "Moderate", or "Severe" (or "N/A" if healthy),
  "confidence": number between 0-100,
  "symptoms": ["list", "of", "visible", "symptoms"],
  "causes": ["possible", "causes"],
  "treatment": {
    "immediate": ["immediate", "actions", "to", "take"],
    "preventive": ["preventive", "measures"],
    "organic": ["organic", "treatment", "options"],
    "chemical": ["chemical", "treatment", "if", "needed"]
  },
  "affectedParts": ["leaves", "stem", "roots", etc.],
  "spreadRisk": "Low", "Medium", or "High",
  "recommendation": "Brief overall recommendation for the farmer"
}`;

    const userPrompt = cropType 
      ? `Analyze this ${cropType} crop image for any diseases or health issues.`
      : `Analyze this crop image for any diseases or health issues.`;

    console.log('Calling Lovable AI for disease detection...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:image/jpeg;base64,${imageBase64}` 
                } 
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error('Empty AI response');
      return new Response(
        JSON.stringify({ error: 'No analysis received from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI Response:', aiResponse);

    // Parse the JSON response
    let diseaseData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        diseaseData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a default healthy response if parsing fails
      diseaseData = {
        diseaseDetected: false,
        diseaseName: "Unable to analyze",
        severity: "N/A",
        confidence: 0,
        symptoms: [],
        causes: [],
        treatment: {
          immediate: [],
          preventive: ["Ensure proper image quality for accurate analysis"],
          organic: [],
          chemical: []
        },
        affectedParts: [],
        spreadRisk: "N/A",
        recommendation: "Please try again with a clearer image of the affected plant part."
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: diseaseData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in crop-disease-detector:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
