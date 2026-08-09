// @ts-nocheck
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

Deno.serve(async (req) => {
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

        if (tier === '30-days' || tier === '90-days') {
          const days = tier === '30-days' ? 30 : 90;
          // Stack on top of any still-active pass: buying again before expiry
          // EXTENDS access instead of silently overlapping (and wasting) the
          // remainder the user already paid for.
          let base = new Date();
          const { data: activeSubs } = await supabase
            .from('subscriptions')
            .select('expires_at')
            .eq('user_id', userId)
            .eq('status', 'active');
          for (const s of activeSubs ?? []) {
            if (s.expires_at && new Date(s.expires_at) > base) {
              base = new Date(s.expires_at);
            }
          }
          const d = new Date(base);
          d.setDate(d.getDate() + days);
          expires_at = d.toISOString();
          console.log(`[Webhook] ${tier} pass expires ${expires_at} (stacked on ${activeSubs?.length ?? 0} active subs)`);
        }

        console.log(`[Webhook] Upserting subscription record for ${userId}...`);
        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            provider: 'stripe',
            product_id: session.id,
            status: 'active',
            started_at,
            expires_at
          }, {
            onConflict: 'product_id'
          });

        if (subError) {
          console.error(`[Webhook] Subscription Upsert Error for ${userId}:`, subError.message);
        } else {
          console.log(`[Webhook] Subscription record upserted successfully for ${userId}`);
        }
      } else {
        console.warn('[Webhook] No client_reference_id or metadata.user_id found in session.');
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Webhook Error: ${message}`);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }
});
