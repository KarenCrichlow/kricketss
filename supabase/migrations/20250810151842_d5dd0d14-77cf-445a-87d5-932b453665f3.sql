-- Fix remaining function search path security issues

CREATE OR REPLACE FUNCTION public.validate_upc_format()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate UPC format (digits only, 8-14 characters)
  IF NEW."UPC" IS NOT NULL AND NOT (NEW."UPC" ~ '^[0-9]{8,14}$') THEN
    RAISE EXCEPTION 'Invalid UPC format. Must be 8-14 digits only.';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_price_range()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate price is positive and reasonable (under $10,000)
  IF NEW.price IS NOT NULL AND (NEW.price <= 0 OR NEW.price > 10000) THEN
    RAISE EXCEPTION 'Invalid price. Must be between $0.01 and $10,000.';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;