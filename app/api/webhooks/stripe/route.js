import { NextResponse } from "next/server";
import { headers } from 'next/headers';
import Stripe from 'stripe';
import pool from "../../../lib/server/dbConnectors/postgresConnector";
import { errorLogger } from "../../../lib/server/errorLoggers/errorLogger";
import { sendEmail } from "../../../lib/server/services/emailSender";

const stripe = new Stripe(process.env.STRIPE_STANDARD_SECRET_KEY);
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY;

export async function POST(req){
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('Stripe-Signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    errorLogger(req.nextUrl, err);
    return NextResponse.json({ error: "Webhook Error: " + err.message }, { status: 400 });
  }

  // Handle events
  if (event.type == "payment_intent.succeeded"){
    const customerId = event.data.object.customer;
    await updateUserPaymentStatus("paid", customerId);
    await sendEmail("drodriguez.dcr@gmail.com", "Payment Success", "You just got paid!")
  }

  if(event.type == "payment_intent.payment_failed"){
    await sendEmail("drodriguez.dcr@gmail.com", "Payment Attempted", "A user's payment has failed!")
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ error: "Stripe payment success." }, { status: 200 });
};

async function updateUserPaymentStatus(paymentStatus, stripeCustomerId){
  try {
    await pool.query(`UPDATE users SET payment_status = $1 WHERE stripe_customer_id = $2`, [paymentStatus, stripeCustomerId])
  } catch(err){
    errorLogger("updateUserPaymentStatus function", err)
  }
}