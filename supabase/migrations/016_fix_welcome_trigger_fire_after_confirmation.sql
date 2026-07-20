-- 016_fix_welcome_trigger_fire_after_confirmation.sql
-- Fix: welcome email should fire when email is confirmed, not on INSERT
-- Drop the INSERT trigger
DROP TRIGGER IF EXISTS on_auth_user_created_welcome_email ON auth.users;

-- Create an UPDATE trigger that fires when email_confirmed_at is set
CREATE OR REPLACE FUNCTION public.send_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when email_confirmed_at transitions from NULL to a value
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://drive-de.vercel.app/api/welcome',
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'type', 'UPDATE',
        'table', 'users',
        'schema', 'auth',
        'record', jsonb_build_object(
          'id', NEW.id,
          'email', NEW.email,
          'raw_user_meta_data', NEW.raw_user_meta_data
        )
      )::text
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[welcome_email] Failed to call webhook: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- New UPDATE trigger on email_confirmed_at
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed_welcome ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed_welcome
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.send_welcome_email();
