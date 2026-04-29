-- 010_auth_signup_trigger.sql
-- Automatically create a profile row in profiles_secure when a new user signs up
-- (c) 2026 DriveDE

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles_secure (id, email, display_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also ensure all existing auth users have a profile row
INSERT INTO public.profiles_secure (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
