<template>
  <div>
    <div class="group">
      <table>
        <tr><td>Customer:</td><td><code>{{ customer.id }}</code></td></tr>
        <tr><td>Name:</td><td><input type="text" size="40" v-model="customer.name"></td></tr>
        <tr><td>Email:</td><td><input type="text" size="40" v-model="customer.email"></td></tr>
        <tr><td>Phone:</td><td><input type="text" size="40" v-model="customer.phone"></td></tr>
      </table>
      <div ref="cardElement"></div>
      <button class="button" :disabled="loading" @click="saveCard">Save Card</button>
    </div>
    <div v-show="customer.id" class="group">
      <table>
        <tr><td>Payment Method:</td><td><code>{{ paymentMethod.id }}</code></td></tr>
        <tr><td>Amount:</td><td><input type="text" v-model="paymentIntent.amount"></td></tr>
        <tr><td>Currency:</td><td><input type="text" v-model="paymentIntent.currency"></td></tr>
        <tr><td>Capture method:</td><td><input type="text" v-model="paymentIntent.captureMethod"></td></tr>
      </table>
      <div class="row"><button class="button" :disabled="!customer.id" @click="chargePaymentMethod">Charge Card</button></div>
      <div class="row"><button class="button" :disabled="!paymentIntent.id" @click="capturePaymentMethod">Capture Card</button></div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const host = 'http://localhost:3000';

export default {
  data() {
    return {
      customer: {
        id: null,
        name: 'Ilkka Salmenius',
        email: 'ilkka.salmennius@gmail.com',
        phone: '050 61698',
      },
      paymentMethod: {
        id: null
      },
      paymentIntent: {
        id: null,
        amount: 195,
        currency: 'eur',
        captureMethod: 'automatic',
      },
      stripe: null,
      cardElement: null,
      clientSecret: null,
      loading: true
    }
  },
  mounted() {
    axios.get(host + '/card-wallet')
      .then(response => {
        this.loading = false;
        console.log(response.data);

        this.clientSecret = response.data.client_secret;

        /* eslint-disable */
        this.stripe = Stripe(response.data.publishableKey);
        /* eslint-enable */
        const elements = this.stripe.elements();

        const style = {
          base: {
            color: "#32325d",
            fontSize: '20px',
          },

          invalid: {
          }
        };      

        this.cardElement = elements.create('card', { style });
        this.cardElement.mount(this.$refs.cardElement);
      });
  },
  methods: {
    saveCard() {
      this.loading = true;

      this.stripe.confirmCardSetup(
        this.clientSecret,
        {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              name: this.cardholderName,
            },
          },
      })
      .then(result => {
        this.loading = false;

        if (result.error) {
          window.console.log(result.error);
          this.showError(result.error.message);
        } else {
          window.console.log(result);
          this.addPaymentMethod(result.setupIntent);
        }
      });
    },
    addPaymentMethod(setupIntent) {
      this.paymentMethod.id = setupIntent.payment_method;

      const data = {
        name: 'Ilkka Salmenius',
        email: 'ilkka.salmenius@gmail.com',
        phone: '050 61698',
        setupIntent
      }

      axios.post(host + '/payment-method/add', data)
        .then(response => {
          console.log(response.data.customer);
          this.customer.id = response.data.customer.id;
        })
    },
    chargePaymentMethod() {
      const data = {
        customerId: this.customer.id,
        amount: this.payment.amount,
        currency: this.payment.currency,
        capture_method: this.payment.captureMethod
      }

      axios.post(host + '/payment-method/charge/' + this.customer.id, data)
        .then(response => {
          console.log(response.data.payment_intent);
          this.paymentIntent.id = response.data.payment_intent.id;
        })
        .catch(error => {
          console.log(error.response);
        });
    },
    capturePaymentMethod() {
      axios.post(host + '/payment/capture/' + this.payment.id)
        .then(response => {
          console.log(response.data.payment_intent);
        })
        .catch(error => {
          console.log(error.response);
        });
    },
  }
}
</script>

<style scoped>
.group {
  margin-top: 20px;
}

.row {
  margin-top: 5px;
}

.code {
  font-family: 'Courier New', Courier, monospace;
}

.result {
  color: green;
  font-family: 'Courier New', Courier, monospace;
}

.error {
  color: red;
  font-family: 'Courier New', Courier, monospace;
}
</style>
