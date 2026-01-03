import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock mandi data - In production, integrate with data.gov.in Agmarknet API
const mandiDatabase = [
  { market: 'APMC Azadpur, Delhi', state: 'Delhi', district: 'New Delhi', lat: 28.7041, lon: 77.1025 },
  { market: 'APMC Vashi, Mumbai', state: 'Maharashtra', district: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { market: 'APMC Yeshwanthpur, Bangalore', state: 'Karnataka', district: 'Bangalore', lat: 12.9716, lon: 77.5946 },
  { market: 'Koyambedu Market, Chennai', state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { market: 'APMC Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', lat: 23.2599, lon: 77.4126 },
  { market: 'Ghazipur Mandi, Delhi', state: 'Delhi', district: 'East Delhi', lat: 28.6280, lon: 77.3273 },
  { market: 'APMC Pune', state: 'Maharashtra', district: 'Pune', lat: 18.5204, lon: 73.8567 },
  { market: 'APMC Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
  { market: 'APMC Jaipur', state: 'Rajasthan', district: 'Jaipur', lat: 26.9124, lon: 75.7873 },
  { market: 'APMC Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lon: 80.9462 },
];

const cropPrices: Record<string, { minPrice: number; maxPrice: number; modalPrice: number }> = {
  'Rice': { minPrice: 1800, maxPrice: 2400, modalPrice: 2100 },
  'Wheat': { minPrice: 2000, maxPrice: 2600, modalPrice: 2300 },
  'Cotton': { minPrice: 5500, maxPrice: 7000, modalPrice: 6200 },
  'Sugarcane': { minPrice: 280, maxPrice: 350, modalPrice: 315 },
  'Maize': { minPrice: 1700, maxPrice: 2200, modalPrice: 1950 },
  'Soybean': { minPrice: 3800, maxPrice: 4500, modalPrice: 4100 },
  'Groundnut': { minPrice: 4500, maxPrice: 5500, modalPrice: 5000 },
  'Tomato': { minPrice: 1500, maxPrice: 3500, modalPrice: 2500 },
  'Onion': { minPrice: 1000, maxPrice: 2500, modalPrice: 1800 },
  'Potato': { minPrice: 800, maxPrice: 1500, modalPrice: 1100 },
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generatePriceVariation(basePrice: number): number {
  const variation = (Math.random() - 0.5) * 0.2 * basePrice;
  return Math.round(basePrice + variation);
}

function generatePriceTrend(basePrice: number, days: number): Array<{ date: string; price: number }> {
  const trend: Array<{ date: string; price: number }> = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const variation = (Math.random() - 0.5) * 0.15 * basePrice;
    trend.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(basePrice + variation),
    });
  }
  
  return trend;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { crop, state, lat, lon, days = 7 } = await req.json();
    console.log(`Fetching mandi prices for crop: ${crop}, state: ${state}, lat: ${lat}, lon: ${lon}`);

    const basePrices = cropPrices[crop] || { minPrice: 1500, maxPrice: 2500, modalPrice: 2000 };

    // Filter mandis by state if provided
    let filteredMandis = state 
      ? mandiDatabase.filter(m => m.state.toLowerCase() === state.toLowerCase())
      : mandiDatabase;

    // If no mandis in state, use all
    if (filteredMandis.length === 0) {
      filteredMandis = mandiDatabase;
    }

    // Calculate distances and generate prices for each mandi
    const mandiPrices = filteredMandis.map(mandi => {
      const distance = lat && lon 
        ? calculateDistance(lat, lon, mandi.lat, mandi.lon)
        : Math.random() * 200 + 50;

      return {
        market: mandi.market,
        state: mandi.state,
        district: mandi.district,
        crop,
        minPrice: generatePriceVariation(basePrices.minPrice),
        maxPrice: generatePriceVariation(basePrices.maxPrice),
        modalPrice: generatePriceVariation(basePrices.modalPrice),
        distance: Math.round(distance),
        arrivalDate: new Date().toISOString().split('T')[0],
        priceTrend: generatePriceTrend(basePrices.modalPrice, days),
      };
    });

    // Sort by a score combining price and distance
    mandiPrices.sort((a, b) => {
      const scoreA = a.modalPrice / 1000 - a.distance / 100;
      const scoreB = b.modalPrice / 1000 - b.distance / 100;
      return scoreB - scoreA;
    });

    // Find best market
    const bestMarket = mandiPrices[0];

    return new Response(JSON.stringify({
      prices: mandiPrices.slice(0, 5),
      bestMarket: {
        name: bestMarket.market,
        price: bestMarket.modalPrice,
        distance: bestMarket.distance,
        recommendation: `Best market to sell today: ${bestMarket.market} at ₹${bestMarket.modalPrice}/quintal (${bestMarket.distance} km away)`,
      },
      priceTrend: bestMarket.priceTrend,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in mandi-prices function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
