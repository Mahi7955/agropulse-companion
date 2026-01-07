import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const equipmentType = url.searchParams.get('type');
    const district = url.searchParams.get('district');
    const maxPrice = url.searchParams.get('maxPrice');
    const availableOnly = url.searchParams.get('availableOnly') !== 'false';

    console.log('Fetching equipment with filters:', { equipmentType, district, maxPrice, availableOnly });

    let query = supabase
      .from('equipment')
      .select(`
        *,
        farmers:owner_id (
          name,
          phone,
          district,
          state,
          latitude,
          longitude
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (availableOnly) {
      query = query.eq('is_available', true);
    }
    
    if (equipmentType && equipmentType !== 'all') {
      query = query.eq('equipment_type', equipmentType);
    }
    
    if (district && district !== 'all') {
      query = query.eq('district', district);
    }
    
    if (maxPrice) {
      query = query.lte('daily_price', parseFloat(maxPrice));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch equipment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${data?.length || 0} equipment listings`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data || [],
        count: data?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in equipment function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
