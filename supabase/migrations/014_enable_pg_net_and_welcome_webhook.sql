-- 014_enable_pg_net_and_welcome_webhook.sql
-- Enable pg_net for async HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create a function that fires the welcome email webhook via HTTP
CREATE OR REPLACE FUNCTION public.send_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://drive-de.vercel.app/api/welcome',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'users',
      'schema', 'auth',
      'record', jsonb_build_object(
        'id', NEW.id,
        'email', NEW.email,
        'raw_user_meta_data', NEW.raw_user_meta_data
      )
    )::text
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block signup if webhook fails
  RAISE WARNING '[welcome_email] Failed to call webhook: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_welcome_email ON auth.users;
CREATE TRIGGER on_auth_user_created_welcome_email
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.send_welcome_email();
