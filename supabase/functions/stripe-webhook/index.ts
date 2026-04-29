import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^12';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  try {
    const body = await req.text();
    
    // Use constructEventAsync with the subtle crypto provider
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || '',
      undefined,
      cryptoProvider
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.user_id;
      const tier = session.metadata?.tier;
      
      console.log(`[Webhook] Session Completed Event. User: ${userId}, Tier: ${tier}, SessionID: ${session.id}`);

      if (userId) {
        console.log(`[Webhook] Attempting to update profile_secure for ${userId}...`);
        
        // 1. Update Profile (using direct table to ensure updatability)
        const { data: profileUpdate, error: profileError } = await supabase
          .from('profiles_secure')
          .update({ is_premium: true })
          .eq('id', userId)
          .select();

        if (profileError) {
          console.error(`[Webhook] Profile Update Error for ${userId}:`, profileError.message);
        } else {
          console.log(`[Webhook] Profile updated successfully. Rows affected: ${profileUpdate?.length}`);
        }
        
        // 2. Log subscription details
        const started_at = new Date().toISOString();
        let expires_at = null;
        
        if (tier === '30-days') {
          const d = new Date();
          d.setDate(d.getDate() + 30);
          expires_at = d.toISOString();
        } else if (tier === '90-days') {
          const d = new Date();
          d.setDate(d.getDate() + 90);
          expires_at = d.toISOString();
        }

        console.log(`[Webhook] Inserting subscription record for ${userId}...`);
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            provider: 'stripe',
            product_id: session.id,
            status: 'active',
            started_at,
            expires_at
          });

        if (subError) {
          console.error(`[Webhook] Subscription Insert Error for ${userId}:`, subError.message);
        } else {
          console.log(`[Webhook] Subscription record created successfully for ${userId}`);
        }
      } else {
        console.warn('[Webhook] No client_reference_id or metadata.user_id found in session.');
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
