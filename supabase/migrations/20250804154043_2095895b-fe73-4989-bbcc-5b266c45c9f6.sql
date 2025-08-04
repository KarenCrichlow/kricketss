-- Create price_entries table to track prices at different stores
CREATE TABLE public.price_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_uid INTEGER NOT NULL,
  store_id SMALLINT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints (using correct case-sensitive column names)
ALTER TABLE public.price_entries 
ADD CONSTRAINT fk_price_entries_product 
FOREIGN KEY (product_uid) REFERENCES public."Food Items"("UID");

ALTER TABLE public.price_entries 
ADD CONSTRAINT fk_price_entries_store 
FOREIGN KEY (store_id) REFERENCES public."Stores"(id);

-- Enable Row Level Security
ALTER TABLE public.price_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for price entries (allowing public access since your other tables do too)
CREATE POLICY "Anyone can view price entries" 
ON public.price_entries 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert price entries" 
ON public.price_entries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update price entries" 
ON public.price_entries 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete price entries" 
ON public.price_entries 
FOR DELETE 
USING (true);

-- Create function to update timestamps (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_price_entries_updated_at
    BEFORE UPDATE ON public.price_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_price_entries_product_uid ON public.price_entries(product_uid);
CREATE INDEX idx_price_entries_store_id ON public.price_entries(store_id);