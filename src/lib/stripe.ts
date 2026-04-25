/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!publicKey) {
      console.warn('VITE_STRIPE_PUBLIC_KEY is not defined in your environment variables.');
    }
    stripePromise = loadStripe(publicKey || '');
  }
  return stripePromise;
};
