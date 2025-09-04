-- Fix security issue with update_updated_at_column function
-- This replaces the function with a version that has an immutable search_path

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Recreate the function with a fixed search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Comment explaining the function
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Updates the updated_at column to the current timestamp when a row is modified';