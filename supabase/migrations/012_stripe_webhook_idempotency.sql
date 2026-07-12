-- 012_stripe_webhook_idempotency.sql
-- (c) 2026 DriveDE. All rights reserved.

-- 1. Ensure any duplicate subscriptions are cleaned up before adding the unique constraint.
DELETE FROM public.subscriptions a
USING public.subscriptions b
WHERE a.id < b.id
  AND a.product_id = b.product_id;

-- 2. Add the unique constraint to product_id
ALTER TABLE public.subscriptions ADD CONSTRAINT unique_subscriptions_product_id UNIQUE (product_id);
