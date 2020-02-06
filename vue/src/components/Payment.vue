<template>
  <div>
    <div class="group">
      <table>
        <tr><td>Customer:</td><td><div class="id">{{ customer.customerId }}</div></td></tr>
        <tr><td>Name:</td><td><input type="text" size="40" v-model="customer.name"></td></tr>
        <tr><td>Email:</td><td><input type="text" size="40" v-model="customer.email"></td></tr>
        <tr><td>Phone:</td><td><input type="text" size="40" v-model="customer.phone"></td></tr>
      </table>
      <CardSetup :host="host" :name="customer.name" :email="customer.email" :phone="customer.phone" @setup="cardSetup"/>
    </div>
    <div v-show="customer.customerId" class="group">
      <table>
        <tr><td>Payment Method:</td><td><div class="id">{{ customer.paymentMethodId }}</div></td></tr>
        <tr><td>Amount:</td><td><input type="text" size="12" v-model="paymentIntent.amount"></td></tr>
        <tr>
          <td>Currency:</td>
          <td>
            <select v-model="paymentIntent.currency">
              <option>eur</option>
              <option>usd</option>
              <option>gbp</option>
              <option>sek</option>
              <option>nok</option>
              <option>dkk</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>Capture method:</td>
          <td>
            <select v-model="paymentIntent.captureMethod">
              <option>automatic</option>
              <option>manual</option>
            </select>
          </td>
        </tr>
      </table>
      <div class="row">
        <button class="button" :disabled="!customer.customerId || paymentIntent.captureNeeded || processing" @click="createPayment">Create Payment</button>
        <button v-if="paymentIntent.captureNeeded" class="button" :disabled="processing" @click="capturePayment">Capture Payment</button>
        <button v-if="paymentIntent.captureNeeded" class="button" :disabled="processing" @click="cancelPayment">Cancel Payment</button>
      </div>
      <div class="success">{{paymentIntent.success}}</div>
      <div class="error">{{paymentIntent.error}}</div>
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
        captureNeeded: false,
        error: null
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
      this.beginWait();

      const data = {
        customerId: this.customer.customerId,
        amount: this.paymentIntent.amount,
        currency: this.paymentIntent.currency,
        capture_method: this.paymentIntent.captureMethod
      }

      axios.post(this.host + '/payment/create-by-first-customer-method/' + this.customer.customerId, data)
        .then(response => {
          console.log(response.data.payment_intent);
          this.paymentIntent.paymentId = response.data.payment_intent.id;
          this.paymentIntent.captureNeeded = this.paymentIntent.captureMethod == 'manual';

          this.endWait();
        })
        .catch(error => this.paymentError(error));
    },
    capturePayment() {
      this.beginWait();

      axios.post(this.host + '/payment/capture/' + this.paymentIntent.paymentId)
        .then(response => {
          console.log(response.data.payment_intent);
          this.paymentIntent.captureNeeded = false;

          this.endWait();
        })
        .catch(error => this.paymentError(error));
    },
    cancelPayment() {
      this.beginWait();

      axios.post(this.host + '/payment/cancel/' + this.paymentIntent.paymentId)
        .then(response => {
          console.log(response.data.payment_intent);
          this.paymentIntent.captureNeeded = false;

          this.endWait();
        })
        .catch(error => this.paymentError(error));
    },
    beginWait() {
      this.processing = true;
      this.paymentIntent.success = '';
      this.paymentIntent.error = '';
    },
    endWait() {
      this.paymentIntent.success = 'Succeeded';
      this.processing = false;
    },
    paymentError(error) {
      console.log(error.response);
      this.paymentIntent.error = error.response.data.message;
      this.processing = false;
    }
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

.id {
  font-family: 'Courier New', Courier, monospace;
  color: green;
}

.success {
  margin-top: 10px;
  color: green;
}

.error {
  margin-top: 10px;
  color: red;
}
</style>
