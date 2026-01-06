import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { district, market, commodity } = await req.json();
    console.log(`Fetching APMC prices - District: ${district}, Market: ${market}, Commodity: ${commodity}`);

    // Build query with filters
    let query = supabase
      .from('apmc_prices')
      .select('*')
      .order('arrival_date', { ascending: false });

    if (district && district !== 'all') {
      query = query.eq('district', district);
    }
    if (market && market !== 'all') {
      query = query.eq('market', market);
    }
    if (commodity && commodity !== 'all') {
      query = query.eq('commodity', commodity);
    }

    const { data: prices, error } = await query.limit(100);

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch prices from database. Please ensure CSV data has been loaded.',
        details: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!prices || prices.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No price data available. Please load CSV data first.',
        prices: [],
        filterOptions: { districts: [], markets: [], commodities: [] }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get unique filter options
    const { data: allData } = await supabase
      .from('apmc_prices')
      .select('district, market, commodity');

    const districts = [...new Set(allData?.map(d => d.district) || [])].sort();
    const markets = [...new Set(allData?.map(d => d.market) || [])].sort();
    const commodities = [...new Set(allData?.map(d => d.commodity) || [])].sort();

    // Find best market (highest modal price)
    const bestMarket = prices.reduce((best, current) => 
      current.modal_price > best.modal_price ? current : best
    , prices[0]);

    // Format prices for frontend (show only modal_price prominently)
    const formattedPrices = prices.map(p => ({
      id: p.id,
      market: p.market,
      district: p.district,
      state: p.state,
      commodity: p.commodity,
      variety: p.variety,
      grade: p.grade,
      modalPrice: p.modal_price,
      minPrice: p.min_price,
      maxPrice: p.max_price,
      arrivalDate: p.arrival_date,
    }));

    console.log(`Returning ${formattedPrices.length} prices`);

    return new Response(JSON.stringify({
      prices: formattedPrices,
      bestMarket: {
        name: bestMarket.market,
        price: bestMarket.modal_price,
        commodity: bestMarket.commodity,
        district: bestMarket.district,
        recommendation: `Best price for ${bestMarket.commodity}: ₹${bestMarket.modal_price}/quintal at ${bestMarket.market}`,
      },
      filterOptions: {
        districts,
        markets,
        commodities,
      },
      dataSource: 'Karnataka APMC CSV',
      lastUpdated: prices[0]?.created_at || new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in mandi-prices function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: `Failed to fetch market prices: ${errorMessage}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
