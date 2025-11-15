-- Add latitude and longitude to hospitals table for GPS-based discovery
ALTER TABLE public.hospitals
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_hospitals_location ON public.hospitals(latitude, longitude);

-- Update existing hospitals with sample coordinates (India - Delhi, Mumbai, Bangalore)
UPDATE public.hospitals 
SET latitude = 28.7041, longitude = 77.1025 
WHERE name LIKE '%Delhi%' OR location LIKE '%Delhi%';

UPDATE public.hospitals 
SET latitude = 19.0760, longitude = 72.8777 
WHERE name LIKE '%Mumbai%' OR location LIKE '%Mumbai%';

UPDATE public.hospitals 
SET latitude = 12.9716, longitude = 77.5946 
WHERE name LIKE '%Bangalore%' OR location LIKE '%Bangalore%';

-- Set default coordinates for any remaining hospitals (Delhi as fallback)
UPDATE public.hospitals 
SET latitude = 28.6139, longitude = 77.2090 
WHERE latitude IS NULL;