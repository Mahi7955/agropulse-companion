-- Create apmc_prices table to store Karnataka APMC market data
CREATE TABLE public.apmc_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  market TEXT NOT NULL,
  commodity TEXT NOT NULL,
  variety TEXT,
  grade TEXT,
  arrival_date DATE NOT NULL,
  min_price NUMERIC NOT NULL,
  max_price NUMERIC NOT NULL,
  modal_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.apmc_prices ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (market prices are public data)
CREATE POLICY "Anyone can view APMC prices" 
ON public.apmc_prices 
FOR SELECT 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_apmc_prices_district ON public.apmc_prices(district);
CREATE INDEX idx_apmc_prices_market ON public.apmc_prices(market);
CREATE INDEX idx_apmc_prices_commodity ON public.apmc_prices(commodity);
CREATE INDEX idx_apmc_prices_arrival_date ON public.apmc_prices(arrival_date DESC);