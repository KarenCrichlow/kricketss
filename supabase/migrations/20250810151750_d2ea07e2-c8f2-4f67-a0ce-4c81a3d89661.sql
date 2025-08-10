-- PHASE 1: CRITICAL RLS POLICY FIXES

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view food items" ON public."Food Items";
DROP POLICY IF EXISTS "Anyone can update food items" ON public."Food Items";
DROP POLICY IF EXISTS "Anyone can view price entries" ON public.price_entries;
DROP POLICY IF EXISTS "Anyone can insert price entries" ON public.price_entries;
DROP POLICY IF EXISTS "Anyone can update price entries" ON public.price_entries;
DROP POLICY IF EXISTS "Anyone can delete price entries" ON public.price_entries;
DROP POLICY IF EXISTS "Anyone can view stores" ON public."Stores";

-- SECURE FOOD ITEMS POLICIES
CREATE POLICY "Authenticated users can view food items" 
ON public."Food Items" 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert food items" 
ON public."Food Items" 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update food items" 
ON public."Food Items" 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete food items" 
ON public."Food Items" 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- SECURE PRICE ENTRIES POLICIES
CREATE POLICY "Authenticated users can view price entries" 
ON public.price_entries 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert price entries" 
ON public.price_entries 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update price entries" 
ON public.price_entries 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete price entries" 
ON public.price_entries 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- SECURE STORES POLICIES
CREATE POLICY "Anyone can view stores" 
ON public."Stores" 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert stores" 
ON public."Stores" 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update stores" 
ON public."Stores" 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete stores" 
ON public."Stores" 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- PHASE 2: DATABASE SECURITY HARDENING

-- Fix existing database function security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile with email from auth metadata and pending status
  INSERT INTO public.profiles (id, email, full_name, division, status)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'division', ''),
    'pending'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;

-- Add input validation triggers for critical fields
CREATE OR REPLACE FUNCTION public.validate_upc_format()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Validate UPC format (digits only, 8-14 characters)
  IF NEW."UPC" IS NOT NULL AND NOT (NEW."UPC" ~ '^[0-9]{8,14}$') THEN
    RAISE EXCEPTION 'Invalid UPC format. Must be 8-14 digits only.';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER validate_food_items_upc
  BEFORE INSERT OR UPDATE ON public."Food Items"
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_upc_format();

-- Add price validation
CREATE OR REPLACE FUNCTION public.validate_price_range()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Validate price is positive and reasonable (under $10,000)
  IF NEW.price IS NOT NULL AND (NEW.price <= 0 OR NEW.price > 10000) THEN
    RAISE EXCEPTION 'Invalid price. Must be between $0.01 and $10,000.';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER validate_price_entries_price
  BEFORE INSERT OR UPDATE ON public.price_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_price_range();

-- Add audit logging table for administrative actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add audit trigger function
CREATE OR REPLACE FUNCTION public.log_admin_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only log if user has admin role
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    INSERT INTO public.admin_audit_log (
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id::text, OLD.id::text),
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Add audit triggers for sensitive tables
CREATE TRIGGER audit_food_items
  AFTER INSERT OR UPDATE OR DELETE ON public."Food Items"
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_price_entries
  AFTER INSERT OR UPDATE OR DELETE ON public.price_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_profiles
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_action();