-- Create equipment table for farm equipment sharing marketplace
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  equipment_type TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  description TEXT,
  daily_price NUMERIC NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  latitude NUMERIC,
  longitude NUMERIC,
  district TEXT,
  state TEXT,
  phone_contact TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Public can view all equipment
CREATE POLICY "Anyone can view equipment" 
ON public.equipment 
FOR SELECT 
USING (true);

-- Owners can insert their own equipment
CREATE POLICY "Farmers can add their own equipment" 
ON public.equipment 
FOR INSERT 
WITH CHECK (owner_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid()));

-- Owners can update their own equipment
CREATE POLICY "Farmers can update their own equipment" 
ON public.equipment 
FOR UPDATE 
USING (owner_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid()));

-- Owners can delete their own equipment
CREATE POLICY "Farmers can delete their own equipment" 
ON public.equipment 
FOR DELETE 
USING (owner_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid()));

-- Add indexes for faster queries
CREATE INDEX idx_equipment_type ON public.equipment(equipment_type);
CREATE INDEX idx_equipment_available ON public.equipment(is_available);
CREATE INDEX idx_equipment_district ON public.equipment(district);
CREATE INDEX idx_equipment_price ON public.equipment(daily_price);

-- Add trigger for updated_at
CREATE TRIGGER update_equipment_updated_at
BEFORE UPDATE ON public.equipment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();