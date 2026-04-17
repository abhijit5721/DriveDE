import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Stripe } from "https://esm.sh/stripe@12.0.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.client_reference_id
      const tier = session.metadata?.tier

      if (userId) {
        // 1. Update Profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', userId)

        if (profileError) throw profileError

        // 2. Log subscription details
        const started_at = new Date().toISOString()
        let expires_at = null
        
        if (tier === '30-days') {
          const d = new Date()
          d.setDate(d.getDate() + 30)
          expires_at = d.toISOString()
        } else if (tier === '90-days') {
          const d = new Date()
          d.setDate(d.getDate() + 90)
          expires_at = d.toISOString()
        }

        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            provider: 'stripe',
            product_id: session.id,
            status: 'active',
            started_at,
            expires_at
          })

        if (subError) throw subError
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
