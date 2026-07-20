-- 015_fix_welcome_webhook_use_net_schema.sql
-- Fix send_welcome_email to use correct net.http_post from pg_net
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
