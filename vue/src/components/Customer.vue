<template>
  <div>
    <div class="group">
      <table>
        <tr><td>Name:</td><td><input type="text" size="40" v-model="customer.name"></td></tr>
        <tr><td>Email:</td><td><input type="text" size="40" v-model="customer.email"></td></tr>
        <tr><td>Phone:</td><td><input type="text" size="40" v-model="customer.phone"></td></tr>
      </table>
      <div ref="cardElement"></div>
      <button class="button" :disabled="loading" @click="saveCard">Save Card</button>
    </div>
    <div v-show="customer.id" class="group">
      <table>
        <tr><td>Customer:</td><td><code>{{ customer.id }}</code></td></tr>
        <tr><td>Payment Method:</td><td><code>{{ paymentMethod.id }}</code></td></tr>
        <tr><td>Amount:</td><td><input type="text" v-model="paymentIntent.amount"></td></tr>
        <tr><td>Currency:</td><td><input type="text" v-model="paymentIntent.currency"></td></tr>
        <tr><td>Capture method:</td><td><input type="text" v-model="paymentIntent.captureMethod"></td></tr>
      </table>
      <div class="row">
        <button class="button" :disabled="!customer.id || paymentIntent.captureNeeded" @click="createPaymentMethod">Create Payment</button>
        <button v-if="paymentIntent.captureNeeded" class="button" @click="capturePaymentMethod">Capture Payment</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import CardSetup from './CardSetup.vue'

const host = 'http://localhost:3000';

export default {
  components: {
    CardSetup
  },
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
        captureNeeded: false
      },
      stripe: null,
      clientSecret: null,
      cardElement: null,
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
        name: this.customer.name,
        email: this.customer.email,
        phone: this.customer.phone,
        setupIntent
      }

      axios.post(host + '/payment-method/add', data)
        .then(response => {
          console.log(response.data.customer);
          this.customer.id = response.data.customer.id;
        })
    },
    createPaymentMethod() {
      const data = {
        customerId: this.customer.id,
        amount: this.paymentIntent.amount,
        currency: this.paymentIntent.currency,
        capture_method: this.paymentIntent.captureMethod
      }

      axios.post(host + '/payment-method/charge/' + this.customer.id, data)
        .then(response => {
          console.log(response.data.payment_intent);
          this.paymentIntent.id = response.data.payment_intent.id;
          this.paymentIntent.captureNeeded = this.paymentIntent.captureMethod == 'manual';
        })
        .catch(error => {
          console.log(error.response);
        });
    },
    capturePaymentMethod() {
      axios.post(host + '/payment/capture/' + this.paymentIntent.id)
        .then(response => {
          console.log(response.data.payment_intent);
          this.paymentIntent.captureNeeded = false;
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
