<template>
  <div>
    <div class="group">
      <table>
        <tr><td>Customer:</td><td><code>{{ customer.customerId }}</code></td></tr>
        <tr><td>Name:</td><td><input type="text" size="40" v-model="customer.name"></td></tr>
        <tr><td>Email:</td><td><input type="text" size="40" v-model="customer.email"></td></tr>
        <tr><td>Phone:</td><td><input type="text" size="40" v-model="customer.phone"></td></tr>
      </table>
      <CardSetup :host="host" :name="customer.name" :email="customer.email" :phone="customer.phone" @setup="cardSetup"/>
    </div>
    <div v-show="customer.customerId" class="group">
      <table>
        <tr><td>Payment Method:</td><td><code>{{ customer.paymentMethodId }}</code></td></tr>
        <tr><td>Amount:</td><td><input type="text" v-model="paymentIntent.amount"></td></tr>
        <tr><td>Currency:</td><td><input type="text" v-model="paymentIntent.currency"></td></tr>
        <tr><td>Capture method:</td><td><input type="text" v-model="paymentIntent.captureMethod"></td></tr>
      </table>
      <div class="row">
        <button class="button" :disabled="!customer.customerId || paymentIntent.captureNeeded || processing" @click="createPayment">Create Payment</button>
        <button v-if="paymentIntent.captureNeeded" class="button" :disabled="processing" @click="capturePayment">Capture Payment</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import CardSetup from './CardSetup.vue'

export default {
  components: {
    CardSetup
  },
  data() {
    return {
      host: 'http://localhost:3000',
      customer: {
        customerId: null,
        paymentMethodId: null,
        name: 'Ilkka Salmenius',
        email: 'ilkka.salmennius@gmail.com',
        phone: '050 61698',
      },
      paymentIntent: {
        paymentId: null,
        amount: 195,
        currency: 'eur',
        captureMethod: 'automatic',
        captureNeeded: false
      },
      processing: false
    }
  },
  methods: {
    cardSetup(data) {
      this.customer.customerId = data.customerId;
      this.customer.paymentMethodId = data.paymentMethodId;
    },
    createPayment() {
      this.processing = true;

      const data = {
        customerId: this.customer.customerId,
        amount: this.paymentIntent.amount,
        currency: this.paymentIntent.currency,
        capture_method: this.paymentIntent.captureMethod
      }

      axios.post(this.host + '/payment-method/charge/' + this.customer.customerId, data)
        .then(response => {
          console.log(response.data.payment_intent);
          this.paymentIntent.paymentId = response.data.payment_intent.id;
          this.paymentIntent.captureNeeded = this.paymentIntent.captureMethod == 'manual';
          this.processing = false;
        })
        .catch(error => {
          console.log(error.response);
          this.processing = false;
        });
    },
    capturePayment() {
      this.processing = true;

      axios.post(this.host + '/payment/capture/' + this.paymentIntent.paymentId)
        .then(response => {
          console.log(response.data.payment_intent);
          this.paymentIntent.captureNeeded = false;
          this.processing = false;
        })
        .catch(error => {
          console.log(error.response);
          this.processing = false;
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
</style>
