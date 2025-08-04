-- Allow users to select from Stores table
CREATE POLICY "Anyone can view stores" 
ON public."Stores" 
FOR SELECT 
USING (true);