const cors = require('cors')
const express = require('express')
const stripe = require('stripe')('sk_test_hA7iiYgRGu50SqpvjXKBoSaS00IWhjTYrp');

const app = express();
app.use(cors());
app.use(express.json());

const publishableKey = 'pk_test_HwIJnmPtdGVutsLWw6LZfxiV00POcWLBUN';


app.get('/card-wallet', async (req, res) => {
  const setupIntent =  await stripe.setupIntents.create();

  res.send({
    publishableKey,
    client_secret: setupIntent.client_secret 
  });
});

app.get('/payment-methods/:customerId', async (req, res) => {
  const customerId = req.params.customerId;
  console.log('customerId', customerId);

  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });  

  res.send(paymentMethods);
});

app.post('/payment-method/add', async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const setupIntent = req.body.setupIntent;

  const customer = await stripe.customers.create({
    name,
    email,
    phone,
    payment_method: setupIntent.payment_method
  });

  console.log(`Customer ${customer.id} with Payment method ${setupIntent.payment_method} added`);

  res.send({
    customer
  });
});

app.delete('/payment-method/remove/:customerId', async (req, res) => {
  const customerId = req.params.customerId;

  const customer = await stripe.customers.create({
    name,
    email,
    phone,
    payment_method: setupIntent.payment_method
  });

  console.log(`Customer ${customerId} removed`);

  res.send({
    customer
  });
});

app.post('/payment-method/charge/:customerId', async (req, res) => {
  const customer = req.params.customerId;

  const amount = req.body.amount;
  const currency = req.body.currency;

  const paymentMethods = await stripe.paymentMethods.list({
    customer,
    type: 'card',
  });

  if (paymentMethods.data.length > 0) {
    const payment_method = paymentMethods.data[0].id;

    try {
      const payment_intent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer,
        payment_method,
        off_session: true,
        confirm: true
      });

      res.send({
        payment_intent
      });
    } catch (err) {
      // Error code will be authentication_required if authentication is needed
      console.log('Error code is: ', err.code);

      if (err.raw.payment_intent) {
        const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
        console.log('PI retrieved: ', paymentIntentRetrieved.id);    
      }
    }
  }
});


app.post('/create-payment-intent', async (req, res) => {
  const amount = req.body.amount;
  const currency = req.body.currency;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
  });

  res.send({
    publishableKey,
    clientSecret: paymentIntent.client_secret
  });
});

const port = 3000;
app.listen(port, () => console.log(`Stripe REST server listening on port ${port}...`));
