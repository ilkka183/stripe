const host = 'http://localhost:3000';

document.querySelector("button").disabled = true;

fetch(host + '/card-wallet', {
  method: "GET",
})
.then(result => {
  return result.json();
})
.then(data => {
  document.querySelector("button").disabled = false;
  setupElements(data);
});

function setupElements(data) {
  const stripe = Stripe(data.publishableKey);
  var elements = stripe.elements();

  var cardElement = elements.create('card');
  cardElement.mount('#card-element');

  var cardholderName = document.getElementById('cardholder-name');
  var form = document.getElementById('payment-form');
  var clientSecret = data.client_secret;
  
  form.addEventListener('submit', ev => {
    ev.preventDefault();

    document.querySelector("button").disabled = true;

    stripe.confirmCardSetup(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName.value,
          },
        },
    })
    .then(result => {
      document.querySelector("button").disabled = false;

      if (result.error) {
        console.log(error);
      } else {
        console.log(result);
        addPaymentMethod(result.setupIntent);
      }
    });
  });  
}

function addPaymentMethod(setupIntent) {
  const data = {
    name: 'Ilkka Salmenius',
    email: 'ilkka.salmenius@gmail.com',
    phone: '050 61698',
    setupIntent
  }

  fetch(host + '/payment-method/add', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(result => {
    return result.json();
  })
  .then(data => {
    console.log(data.customer);
    charge(data.customer.id, 195);
  })
}

function charge(customerId, amount) {
  const data = {
    customerId,
    amount,
    currency: 'eur'
  }

  fetch(host + '/payment-method/charge/' + customerId, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(result => {
    return result.json();
  })
  .then(data => {
    console.log(data.payment_intent);
  });
}
