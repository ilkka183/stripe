let stripe;

document.querySelector("button").disabled = true;

fetch("http://localhost:3000/create-payment-intent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ amount: 195, currency: 'eur' })
})
.then(result => {
  return result.json();
})
.then(data => {
  return setupElements(data);
})
.then(({ stripe, card, clientSecret }) => {
  document.querySelector("button").disabled = false;

  const form = document.getElementById("payment-form");

  form.addEventListener("submit", event => {
    event.preventDefault();
    pay(stripe, card, clientSecret);
  });
});


function setupElements(data) {
  stripe = Stripe(data.publishableKey);
  const elements = stripe.elements();

  // Card
  const style = {
    base: {
      color: "#32325d",
    }
  };
  
  const card = elements.create('card', { style });
  card.mount('#card-element');

  card.addEventListener('change', ({ error }) => {
    const displayError = document.getElementById('card-errors');
    
    if (error) {
      displayError.textContent = error.message;
    } else {
      displayError.textContent = '';
    }
  });

  return {
    stripe,
    card,
    clientSecret: data.clientSecret
  }
}

function pay(stripe, card, clientSecret) {
  document.querySelector("button").disabled = true;

  stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card
      }
    })
    .then(result => {
      document.querySelector("button").disabled = false;

      if (result.error) {
        console.log(result.error.message);

        const displayError = document.getElementById('payment-errors');
        displayError.textContent = result.error.message;
      } else {
        console.log(result);
        console.log('The payment has been processed!');
      }
    });
}
