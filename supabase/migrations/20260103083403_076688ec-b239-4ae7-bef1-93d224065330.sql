-- Create farmers profile table
CREATE TABLE public.farmers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  state TEXT,
  district TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create farms table
CREATE TABLE public.farms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  sowing_date DATE NOT NULL,
  season TEXT NOT NULL CHECK (season IN ('Kharif', 'Rabi', 'Zaid')),
  area_acres DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  expense_type TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price alerts table
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  target_price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farmers
CREATE POLICY "Users can view their own farmer profile" 
ON public.farmers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own farmer profile" 
ON public.farmers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farmer profile" 
ON public.farmers FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for farms
CREATE POLICY "Users can view their own farms" 
ON public.farms FOR SELECT 
USING (farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid()));

CREATE POLICY "Users can create farms" 
ON public.farms FOR INSERT 
WITH CHECK (farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own farms" 
ON public.farms FOR UPDATE 
USING (farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own farms" 
ON public.farms FOR DELETE 
USING (farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid()));

-- RLS Policies for expenses
CREATE POLICY "Users can view their own expenses" 
ON public.expenses FOR SELECT 
USING (farm_id IN (
  SELECT f.id FROM public.farms f 
  JOIN public.farmers fa ON f.farmer_id = fa.id 
  WHERE fa.user_id = auth.uid()
));

CREATE POLICY "Users can create expenses" 
ON public.expenses FOR INSERT 
WITH CHECK (farm_id IN (
  SELECT f.id FROM public.farms f 
  JOIN public.farmers fa ON f.farmer_id = fa.id 
  WHERE fa.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own expenses" 
ON public.expenses FOR DELETE 
USING (farm_id IN (
  SELECT f.id FROM public.farms f 
  JOIN public.farmers fa ON f.farmer_id = fa.id 
  WHERE fa.user_id = auth.uid()
));

-- RLS Policies for price_alerts
CREATE POLICY "Users can view their own alerts" 
ON public.price_alerts FOR SELECT 
USING (farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid()));

CREATE POLICY "Users can create alerts" 
ON public.price_alerts FOR INSERT 
WITH CHECK (farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own alerts" 
ON public.price_alerts FOR UPDATE 
USING (farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own alerts" 
ON public.price_alerts FOR DELETE 
USING (farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid()));

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_farmers_updated_at
BEFORE UPDATE ON public.farmers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farms_updated_at
BEFORE UPDATE ON public.farms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();