const cors = require('cors')
const express = require('express')
const stripe = require('stripe')('sk_test_hA7iiYgRGu50SqpvjXKBoSaS00IWhjTYrp');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-payment-intent', async (request, response) => {
  const amount = request.body.amount;
  const currency = request.body.currency;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
  });

  response.send({
    publishableKey: 'pk_test_HwIJnmPtdGVutsLWw6LZfxiV00POcWLBUN',
    clientSecret: paymentIntent.client_secret
  });
});

const port = 3000;
app.listen(port, () => console.log(`Stripe REST server listening on port ${port}...`));
