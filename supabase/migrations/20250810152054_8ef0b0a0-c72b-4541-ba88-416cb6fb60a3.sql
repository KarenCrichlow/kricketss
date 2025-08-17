-- Fix the remaining function search path issues
-- Update the update_updated_at_column function to set search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Add check constraints using validation functions
ALTER TABLE public."Food Items" 
ADD CONSTRAINT check_valid_upc 
CHECK (public.validate_upc("UPC"));

ALTER TABLE public.price_entries 
ADD CONSTRAINT check_valid_price 
CHECK (public.validate_price(price));

-- Add rate limiting table for API calls
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limits
CREATE POLICY "Users can view their own rate limits" ON public.rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- Function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id uuid,
  _action text,
  _max_requests integer DEFAULT 100,
  _window_minutes integer DEFAULT 60
)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  -- Calculate window start time
  window_start_time := now() - (_window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM public.rate_limits 
  WHERE user_id = _user_id 
    AND action = _action 
    AND window_start < window_start_time;
  
  -- Get current count for this action in the window
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM public.rate_limits
  WHERE user_id = _user_id 
    AND action = _action 
    AND window_start >= window_start_time;
  
  -- Check if limit exceeded
  IF current_count >= _max_requests THEN
    RETURN false;
  END IF;
  
  -- Add this request to the counter
  INSERT INTO public.rate_limits (user_id, action, count, window_start)
  VALUES (_user_id, _action, 1, now())
  ON CONFLICT (user_id, action) 
  WHERE window_start >= window_start_time
  DO UPDATE SET count = rate_limits.count + 1;
  
  RETURN true;
END;
$function$;