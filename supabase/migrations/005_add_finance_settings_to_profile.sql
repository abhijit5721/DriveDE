-- Add financial columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS hourly_rate_45 NUMERIC DEFAULT 60,
ADD COLUMN IF NOT EXISTS fixed_costs JSONB DEFAULT '{
  "registration": 350,
  "theoryExam": 25,
  "practicalExam": 116,
  "learningMaterial": 50,
  "firstAid": 40,
  "visionTest": 7
}'::jsonb;
