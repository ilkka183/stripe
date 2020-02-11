<template>
  <div>
    <div class="group">
      <table>
        <tr><td>Customer:</td><td><span class="id">{{ customerId }}</span></td></tr>
        <tr><td>Name:</td><td><input type="text" size="40" v-model="name"></td></tr>
        <tr><td>Email:</td><td><input type="text" size="60" v-model="email"></td></tr>
        <tr><td>Phone:</td><td><input type="text" size="20" v-model="phone"></td></tr>
      </table>
      <StripeCardGroup :host="host">
        <div v-if="single">
          <StripeCardElement />
        </div>
        <div v-else>
          <StripeCardNumberElement />
          <StripeCardExpiryElement />
          <StripeCardCvcElement />
        </div>
        <StripeCardSaveButton :name="name" :email="email" :phone="phone" @saved="cardSaved" @error="cardError">Save Card</StripeCardSaveButton>
        <div class="error">{{ cardErrorMessage }}</div>
      </StripeCardGroup>
    </div>
    <div v-if="customerId && paymentMethodId" class="group">
      <table>
        <tr><td>Payment Method:</td><td><span class="id">{{ paymentMethodId }}</span></td></tr>
        <tr><td>Amount:</td><td><input type="number" size="12" v-model="amount"></td></tr>
        <tr>
          <td>Currency:</td>
          <td>
            <select v-model="currency">
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
            <select v-model="captureMethod">
              <option>automatic</option>
              <option>manual</option>
            </select>
          </td>
        </tr>
      </table>
      <div class="buttons">
        <button class="button" :disabled="processing || captureNeeded" @click="createPayment">Create Payment</button>
        <template v-if="captureNeeded">
          <button class="button" :disabled="processing" @click="capturePayment">Capture Payment</button>
          <button class="button" :disabled="processing" @click="cancelPayment">Cancel Payment</button>
        </template>
      </div>
      <div vlass="messages">
        <div class="success">{{ paymentSuccessMessage }}</div>
        <div class="error">{{ paymentErrorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import StripeCardGroup from './StripeCardGroup'
import StripeCardElement from './StripeCardElement'
import StripeCardNumberElement from './StripeCardNumberElement'
import StripeCardExpiryElement from './StripeCardExpiryElement'
import StripeCardCvcElement from './StripeCardCvcElement'
import StripeCardSaveButton from './StripeCardSaveButton'

export default {
  components: {
    StripeCardGroup,
    StripeCardElement,
    StripeCardNumberElement,
    StripeCardExpiryElement,
    StripeCardCvcElement,
    StripeCardSaveButton
  },
  data() {
    return {
      host: 'http://localhost:3000/stripe',
      name: 'Ilkka Salmenius',
      email: 'ilkka.salmennius@gmail.com',
      phone: '050 61698',
      single: true,
      customerId: null,
      paymentMethodId: null,
      cardErrorMessage: null,
      paymentId: null,
      paymentSuccessMessage: null,
      paymentErrorMessage: null,
      amount: 195,
      currency: 'eur',
      captureMethod: 'automatic',
      captureNeeded: false,
      processing: false
    }
  },
  methods: {
    cardSaved(data) {
      this.customerId = data.customerId;
      this.paymentMethodId = data.paymentMethodId;
    },
    cardError(errorMessage) {
      this.cardErrorMessage = errorMessage;
    },
    createPayment() {
      this.beginWait();

      const data = {
        customerId: this.customerId,
        amount: this.amount,
        currency: this.currency,
        capture_method: this.captureMethod
      }

      axios.post(this.host + '/payment/create-by-first-customer-method/' + this.customerId, data)
        .then(response => {
          console.log(response.data.payment_intent);
          this.paymentId = response.data.payment_intent.id;
          this.captureNeeded = this.captureMethod == 'manual';
          this.endWait();
        })
        .catch(error => this.paymentError(error));
    },
    capturePayment() {
      this.beginWait();

      axios.post(this.host + '/payment/capture/' + this.paymentId)
        .then(response => {
          console.log(response.data.payment_intent);
          this.captureNeeded = false;
          this.endWait();
        })
        .catch(error => this.paymentError(error));
    },
    cancelPayment() {
      this.beginWait();

      axios.post(this.host + '/payment/cancel/' + this.paymentId)
        .then(response => {
          console.log(response.data.payment_intent);
          this.captureNeeded = false;
          this.endWait();
        })
        .catch(error => this.paymentError(error));
    },
    beginWait() {
      this.paymentSuccessMessage = '';
      this.paymentErrorMessage = '';
      this.processing = true;
    },
    endWait() {
      this.paymentSuccessMessage = 'Succeeded';
      this.processing = false;
    },
    paymentError(error) {
      this.paymentErrorMessage = error.response.data.message;
      this.processing = false;
    },
  }
}
</script>

<style scoped>
.group {
  margin-top: 20px;
}

.buttons {
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
