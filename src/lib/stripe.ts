import Stripe from "stripe" ;

export const stripe = new
Stripe (process.env.STRIPE_SECRET_KEY!,
{
   apiversion: "2024-11-20"
});