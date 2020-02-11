const secretKey = 'sk_test_hA7iiYgRGu50SqpvjXKBoSaS00IWhjTYrp';
const publishableKey = 'pk_test_HwIJnmPtdGVutsLWw6LZfxiV00POcWLBUN';

const cors = require('cors')
const express = require('express')
const stripe = require('stripe')(secretKey);

const app = express();
app.use(cors());
app.use(express.json());


//
// Setup
//

app.get('/stripe/setup', async (req, res) => {
  try {
    const setupIntent = await stripe.setupIntents.create();

    res.send({
      publishableKey,
      client_secret: setupIntent.client_secret 
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).send({ code: err.code, message: err.message });
  }
});


//
// Customer
//

app.post('/stripe/customer/create', async (req, res) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  }

  try {
    const customer = await stripe.customers.create(data);
    console.log(`Customer ${customer.id} created`);

    res.send({
      customer
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).send({ code: err.code, message: err.message });
  }
});

app.delete('/stripe/customer/delete/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await stripe.customers.del(id);
    console.log(`Customer ${id} deleted`);
  
    res.send({
      id
    });
  } catch(err) {
    console.error(err.message);
    res.status(400).send({ code: err.code, message: err.message });
  }
});


//
// Payment method
//

app.get('/stripe/payment-methods/:customerId', async (req, res) => {
  const customerId = req.params.customerId;

  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });  
  
    res.send(paymentMethods);
  } catch (err) {
    console.error(err.message);
    res.status(400).send({ code: err.code, message: err.message });
  }
});

app.post('/stripe/payment-method/attach', async (req, res) => {
  const paymentMethodId = req.body.paymentMethodId;
  const customerId = req.body.customerId;

  try {
    await stripe.paymentMethods.attach(
      paymentMethodId,
      {
        customer: customerId
      }
    );
  
    console.log(`Payment method ${paymentMethodId} attached to customer ${customerId}`);
  
    res.send({
      paymentMethodId,
      customerId
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).send({ code: err.code, message: err.message });
  }
});


//
// Payment
//

app.post('/stripe/payment/create-by-first-customer-method/:customerId', async (req, res) => {
  const customer = req.params.customerId;

  const paymentMethods = await stripe.paymentMethods.list({
    customer,
    type: 'card',
  });

  if (paymentMethods.data.length > 0) {
    const payment_method = paymentMethods.data[0].id;

    const amount = req.body.amount;
    const currency = req.body.currency;
    const capture_method = req.body.capture_method;

    try {
      const payment_intent = await stripe.paymentIntents.create({
        amount,
        currency,
        capture_method,
        customer,
        payment_method,
        off_session: true,
        confirm: true
      });

      console.log(`Payment intent ${payment_intent.id} created`);

      res.send({
        payment_intent
      });
    } catch (err) {
      // Error code will be authentication_required if authentication is needed
      console.error(err.message);
      res.status(400).send({ code: err.code, message: err.message });

      if (err.raw.payment_intent) {
        const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
        console.log('PI retrieved: ', paymentIntentRetrieved.id);    
      }
    }
  }
});

app.post('/stripe/payment/capture/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const payment_intent = await stripe.paymentIntents.capture(id);
    console.log(`Payment intent ${payment_intent.id} captured`);

    res.send({
      payment_intent
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).send({ code: err.code, message: err.message });
  }
});

app.post('/stripe/payment/cancel/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const payment_intent = await stripe.paymentIntents.cancel(id);
    console.log(`Payment intent ${payment_intent.id} cancelled`);

    res.send({
      payment_intent
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).send({ code: err.code, message: err.message });
  }
});


const port = 3000;
app.listen(port, () => console.log(`Stripe REST server listening on port ${port}...`));
