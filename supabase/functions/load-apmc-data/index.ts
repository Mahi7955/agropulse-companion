import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CSV URL - hosted in public folder
const CSV_URL = `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/storage/v1/object/public/apmc-data/karnataka-apmc-prices.csv`;

interface APMCRow {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDate(dateStr: string): string {
  // Format: DD/MM/YYYY -> YYYY-MM-DD
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting APMC data load...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body for CSV content (passed from frontend)
    let csvContent: string;
    try {
      const body = await req.json();
      csvContent = body.csvContent;
      if (!csvContent) {
        throw new Error('No CSV content provided');
      }
    } catch {
      return new Response(JSON.stringify({ 
        error: 'CSV content must be provided in request body' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('CSV content received, parsing...');
    
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);
    console.log('Headers:', headers);

    // Map CSV columns to our expected format
    const columnMap: Record<string, number> = {};
    headers.forEach((header, index) => {
      const normalized = header.toLowerCase().replace(/\s+/g, '_').replace('x0020_', '');
      columnMap[normalized] = index;
    });

    console.log('Column map:', columnMap);

    const rows: APMCRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < 10) continue;

      try {
        rows.push({
          state: values[columnMap['state'] ?? 0] || 'Karnataka',
          district: values[columnMap['district'] ?? 1] || '',
          market: values[columnMap['market'] ?? 2] || '',
          commodity: values[columnMap['commodity'] ?? 3] || '',
          variety: values[columnMap['variety'] ?? 4] || '',
          grade: values[columnMap['grade'] ?? 5] || '',
          arrival_date: parseDate(values[columnMap['arrival_date'] ?? 6] || ''),
          min_price: parseFloat(values[columnMap['min_price'] ?? 7]) || 0,
          max_price: parseFloat(values[columnMap['max_price'] ?? 8]) || 0,
          modal_price: parseFloat(values[columnMap['modal_price'] ?? 9]) || 0,
        });
      } catch (err) {
        console.error(`Error parsing row ${i}:`, err);
      }
    }

    console.log(`Parsed ${rows.length} rows from CSV`);

    if (rows.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No valid data rows found in CSV' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Clear existing data
    const { error: deleteError } = await supabase
      .from('apmc_prices')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (deleteError) {
      console.error('Error clearing existing data:', deleteError);
    }

    // Insert new data in batches
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error: insertError, data } = await supabase
        .from('apmc_prices')
        .insert(batch)
        .select();

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize}:`, insertError);
      } else {
        insertedCount += data?.length || 0;
      }
    }

    console.log(`Successfully inserted ${insertedCount} rows`);

    return new Response(JSON.stringify({
      success: true,
      message: `Loaded ${insertedCount} APMC price records`,
      rowCount: insertedCount,
      lastUpdated: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error loading APMC data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: `Failed to load APMC data: ${errorMessage}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
