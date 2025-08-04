-- Add approval status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create index for faster queries on status
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- Update the handle_new_user function to set pending status by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Update RLS policies to only allow approved users to access the app
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id AND status = 'approved');

-- Allow admins to view all profiles regardless of status
-- (This policy already exists but making sure it covers all statuses)

-- Create policy for pending users to view their own pending status
CREATE POLICY "Pending users can view their own pending profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id AND status = 'pending');