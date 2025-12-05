import pool from '../../../../lib/server/dbConnectors/postgresConnector';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { errorLogger } from '../../../../lib/server/errorLoggers/errorLogger';
import { sendEmail } from '../../../../lib/server/emailSender';

const stripe = new Stripe(process.env.STRIPE_STANDARD_SECRET_KEY);

export async function POST(req, res) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    errorLogger(req.nextUrl, "Webhook secret key error")
    throw new Error('Webhook secret key error')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = await headerPayload.get('svix-id')
  const svix_timestamp = await headerPayload.get('svix-timestamp')
  const svix_signature = await headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    errorLogger(req.nextUrl, "Error occured -- no svix headers")
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    errorLogger(req.nextUrl, err, "signup-webhook")
    return new Response('Error occured', {
      status: 400,
    })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    console.log("User created event received" + JSON.stringify(evt, null, 2));
    const userId = evt.data.id;
    const userEmail = evt.data.email_addresses[0].email_address;

    try {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: userEmail,
      });

      const customerId = customer.id;

      console.log("Customer created in Stripe: " + JSON.stringify(customer, null, 2));


      const joinedAt = Math.floor(Date.now() / 1000);

      const result = await pool.query(
          'INSERT INTO users(user_id, user_email, joined_at, payment_status, stripe_customer_id) VALUES ($1, $2, $3, $4, $5)',
          [userId, userEmail, joinedAt, 'trial', customerId]
        );

      await sendEmail("drodriguez.dcr@gmail.com", "New User Signed Up", "A new user has signed up!")

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
      });

    } catch (error) {
      errorLogger(req.nextUrl, error, "signup-webhook");
      console.error(error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
      });
    }
  }
}