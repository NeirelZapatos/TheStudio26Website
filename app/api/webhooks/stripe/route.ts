import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/app/lib/dbConnect';
import Customer from '@/app/models/Customer';
import Subscription from '@/app/models/Subscription';
import CustomerSubscription from '@/app/models/CustomerSubscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(request: Request) {
  try {
    // Get Stripe signature from header
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const body = await request.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    await dbConnect();

    switch (event.type) {
      // * Checkout session completed - Handle new subscriptions
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // * Only process subscription checkout sessions
        if (session.mode === 'subscription' && session.subscription) {
          console.log(`Processing subscription checkout: ${session.id}`);
          
          // * Get subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
            expand: ['items.data.price.product']
          });
          
          // * Find the customer in our database
          let customerId = session.metadata?.customerId;
          let customer;
          
          if (customerId) {
            customer = await Customer.findById(customerId);
          }
          
          if (!customer && session.customer) {
            customer = await Customer.findOne({ stripe_customer_id: session.customer });
          }
          
          // * If we still don't have a customer, create one
          if (!customer && session.customer_details?.email) {
            customer = new Customer({
              email: session.customer_details.email,
              first_name: session.metadata?.firstName || '',
              last_name: session.metadata?.lastName || '',
              stripe_customer_id: session.customer,
              has_active_subscription: true,
              subscriptions: [],
            });
            await customer.save();
          }
          
          if (!customer) {
            console.error(`Customer not found for subscription: ${subscription.id}`);
            break;
          }
          
          // * Get subscription product IDs from metadata
          const subscriptionIds = session.metadata?.subscriptionIds 
            ? JSON.parse(session.metadata.subscriptionIds) 
            : [];
          
          // * Map subscription items to our database products
          const subscriptionItems = [];
          for (const item of subscription.items.data) {
            const priceId = item.price.id;
            const productId = (item.price.product as Stripe.Product).id;
            
            // * Find the subscription product in our database
            const subscriptionProduct = await Subscription.findOne({ stripeProductId: productId });
            
            if (subscriptionProduct) {
              subscriptionItems.push({
                stripeItemId: item.id,
                stripePriceId: priceId,
                stripeProductId: productId,
                productId: subscriptionProduct._id,
                quantity: item.quantity,
                unitAmount: item.price.unit_amount || 0,
                interval: item.price.recurring?.interval || 'month',
                intervalCount: item.price.recurring?.interval_count || 1,
              });
            }
          }
          
          //*  Create a new customer subscription record
          const customerSubscription = new CustomerSubscription({
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: session.customer,
            customer_id: customer._id,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
            items: subscriptionItems,
            paymentHistory: [{
              invoiceId: subscription.latest_invoice as string,
              amountPaid: 0,
              status: 'created',
              paidAt: new Date(),
            }],
          });
          
          await customerSubscription.save();
          
          // * Update customer with subscription status
          customer.has_active_subscription = true;
          if (!customer.subscriptions) {
            customer.subscriptions = [];
          }
          customer.subscriptions.push(customerSubscription._id);
          await customer.save();
          
          console.log(`Subscription ${subscription.id} saved for customer ${customer._id}`);
        }
        break;
      }
      
      // * Invoice paid - Record successful payment
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // * Only process subscription invoices
        if (invoice.subscription) {
          console.log(`Processing successful payment for subscription: ${invoice.subscription}`);
          
          // * Find subscription in our database
          const customerSubscription = await CustomerSubscription.findOne({ 
            stripeSubscriptionId: invoice.subscription 
          });
          
          if (customerSubscription) {
            // * Add to payment history
            const payment = {
              invoiceId: invoice.id,
              amountPaid: invoice.amount_paid / 100, // Convert to dollars
              status: 'paid',
              paidAt: new Date(),
            };
            
            // * Update subscription payment history and status
            await CustomerSubscription.findByIdAndUpdate(
              customerSubscription._id,
              { 
                $push: { paymentHistory: payment },
                $set: {
                  status: 'active',
                  currentPeriodEnd: new Date((invoice.lines.data[0]?.period?.end || 0) * 1000),
                }
              }
            );
            
            console.log(`Updated payment history for subscription ${invoice.subscription}`);
          }
        }
        break;
      }
      
      // * Subscription updated - Update our records
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);
        
        // * Find subscription in our database
        const customerSubscription = await CustomerSubscription.findOne({ 
          stripeSubscriptionId: subscription.id 
        });
        
        if (customerSubscription) {
          // * Update subscription
          await CustomerSubscription.findByIdAndUpdate(
            customerSubscription._id,
            { 
              $set: {
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
              } 
            }
          );
          
          // ! If subscription was canceled or expired, update customer status
          if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            // * Find customer
            const customer = await Customer.findById(customerSubscription.customer_id);
            
            if (customer) {
              // * Check if customer has any other active subscriptions
              const activeSubscriptions = await CustomerSubscription.countDocuments({
                customer_id: customer._id,
                status: 'active',
                stripeSubscriptionId: { $ne: subscription.id }
              });
              
              if (activeSubscriptions === 0) {
                // * Update customer if no active subscriptions remain
                customer.has_active_subscription = false;
                await customer.save();
              }
            }
          }
        }
        break;
      }
      
      // * Subscription deleted - Update our records
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log(`Subscription deleted: ${subscription.id}`);
        
        // * Find subscription in our database
        const customerSubscription = await CustomerSubscription.findOne({ 
          stripeSubscriptionId: subscription.id 
        });
        
        if (customerSubscription) {
          // * Mark subscription as canceled
          await CustomerSubscription.findByIdAndUpdate(
            customerSubscription._id,
            { 
              $set: {
                status: 'canceled',
                canceledAt: new Date(),
              } 
            }
          );
          
          // * Find customer
          const customer = await Customer.findById(customerSubscription.customer_id);
          
          if (customer) {
            // * Check if customer has any other active subscriptions
            const activeSubscriptions = await CustomerSubscription.countDocuments({
              customer_id: customer._id,
              status: 'active',
              stripeSubscriptionId: { $ne: subscription.id }
            });
            
            if (activeSubscriptions === 0) {
              // * Update customer status if no active subscriptions remain
              customer.has_active_subscription = false;
              await customer.save();
            }
          }
        }
        break;
      }
      
      // * Invoice payment failed - Update subscription status
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          console.log(`Payment failed for subscription: ${invoice.subscription}`);
          
          // * Find subscription in our database
          const customerSubscription = await CustomerSubscription.findOne({ 
            stripeSubscriptionId: invoice.subscription 
          });
          
          if (customerSubscription) {
            // * Update subscription status
            await CustomerSubscription.findByIdAndUpdate(
              customerSubscription._id,
              { 
                $set: { status: 'past_due' },
                $push: { 
                  paymentHistory: {
                    invoiceId: invoice.id,
                    amountPaid: 0,
                    status: 'failed',
                    paidAt: new Date(),
                  } 
                }
              }
            );
          }
        }
        break;
      }
    }

    // * Return success response
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Webhook handler error: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook handler error: ${err.message}` },
      { status: 500 }
    );
  }
}