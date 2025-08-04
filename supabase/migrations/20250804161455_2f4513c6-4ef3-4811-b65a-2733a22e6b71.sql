-- Allow users to select from Food Items table
CREATE POLICY "Anyone can view food items" 
ON public."Food Items" 
FOR SELECT 
USING (true);

-- Allow users to update food items
CREATE POLICY "Anyone can update food items" 
ON public."Food Items" 
FOR UPDATE 
USING (true);