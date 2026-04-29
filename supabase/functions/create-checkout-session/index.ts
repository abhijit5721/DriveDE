import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^12';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // 2. Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // 3. Verify user and get ID
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid user session');
    }

    const { tier, language } = await req.json();
    const user_id = user.id; // Use verified ID from JWT

    // NOTE: Real Stripe Price IDs from Dashboard
    const pricing: Record<string, string> = {
      '30-days': 'price_1TNAE6KdwMS8radbvJpYwVL8',
      '90-days': 'price_1TNAFgKdwMS8radbknDRyljk',
      'lifetime': 'price_1TNAH6KdwMS8radb1ijnRNsP',
    };

    const priceId = pricing[tier];
    if (!priceId) {
      throw new Error('Invalid tier');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      client_reference_id: user_id, 
      metadata: {
        user_id,
        tier
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${req.headers.get('origin')}/`,
      locale: language === 'de' ? 'de' : 'en',
    });
    console.log(`[Checkout] Session created for ${user_id} (${tier})`);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    console.error('[Checkout] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    );
  }
});
