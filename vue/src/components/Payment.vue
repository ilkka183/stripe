<template>
  <div>
    <div class="group">
      <table>
        <tr><td>Customer ID:</td><td><span class="id">{{ customerId }}</span></td></tr>
        <tr><td>Name:</td><td><input type="text" size="40" v-model="name"></td></tr>
        <tr><td>Email:</td><td><input type="text" size="60" v-model="email"></td></tr>
        <tr><td>Phone:</td><td><input type="text" size="20" v-model="phone"></td></tr>
      </table>
      <CardGroup :restPath="restPath">
        <div v-if="separateElements">
          <CardNumberElement />
          <CardExpiryElement />
          <CardCvcElement />
        </div>
        <div v-else>
          <CardElement />
        </div>
        <CardSaveButton :name="name" :email="email" :phone="phone" @saved="cardSaved" @error="cardSaveError">Save Card</CardSaveButton>
      </CardGroup>
    </div>
    <div v-if="customerId && paymentMethodId" class="group">
      <table>
        <tr><td>Payment Method ID:</td><td><span class="id">{{ paymentMethodId }}</span></td></tr>
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
    </div>
    <div v-if="paymentId" class="group">
      <table>
        <tr><td>Payment ID:</td><td><span class="id">{{ paymentId }}</span></td></tr>
      </table>
    </div>
    <div class="group">
      <div class="error">{{ errorMessage }}</div>
      <div class="ok">{{ okMessage }}</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import CardGroup from './stripe/CardGroup'
import CardElement from './stripe/CardElement'
import CardNumberElement from './stripe/CardNumberElement'
import CardExpiryElement from './stripe/CardExpiryElement'
import CardCvcElement from './stripe/CardCvcElement'
import CardSaveButton from './stripe/CardSaveButton'

export default {
  components: {
    CardGroup,
    CardElement,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    CardSaveButton
  },
  data() {
    return {
      restPath: 'http://localhost:3000/stripe',
//      restPath: 'http://localhost:49363/wp-json/juro/v1/stripe',
      email: 'ilkka.salmennius@gmail.com',
      name: 'Ilkka Salmenius',
      phone: '050 61698',
      separateElements: false,
      customerId: null,
      paymentMethodId: null,
      paymentId: null,
      okMessage: null,
      errorMessage: null,
      amount: 195,
      currency: 'eur',
      captureMethod: 'automatic',
      captureNeeded: false,
      processing: false
    }
  },
  mounted() {
  },
  methods: {
    cardSaved(data) {
      this.customerId = data.customerId;
      this.paymentMethodId = data.paymentMethodId;
    },
    cardSaveError(errorMessage) {
      this.errorMessage = errorMessage;
    },
    createPayment() {
      this.beginWait();
      this.paymentId = null;

      const data = {
        customerId: this.customerId,
        amount: this.amount,
        currency: this.currency,
        capture_method: this.captureMethod
      }

      axios.post(this.restPath + '/payment/create-by-first-customer-method/' + this.customerId, data)
        .then(response => {
          this.paymentId = response.data.id;
          this.captureNeeded = this.captureMethod == 'manual';
          this.endOk(response);
        })
        .catch(error => this.endError(error));
    },
    capturePayment() {
      this.beginWait();

      axios.post(this.restPath + '/payment/capture/' + this.paymentId)
        .then(response => {
          this.captureNeeded = false;
          this.endOk(response);
        })
        .catch(error => this.endError(error));
    },
    cancelPayment() {
      this.beginWait();

      axios.post(this.restPath + '/payment/cancel/' + this.paymentId)
        .then(response => {
          this.captureNeeded = false;
          this.endOk(response);
        })
        .catch(error => this.endError(error));
    },
    beginWait() {
      this.okMessage = null;
      this.errorMessage = null;
      this.processing = true;
    },
    endWait() {
      this.processing = false;
    },
    endOk(response) {
      console.log(response.data);

      this.okMessage = 'OK';
      this.endWait();
    },
    endError(error) {
      this.errorMessage = error.response.data.message;
      this.endWait();
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

.ok {
  margin-top: 10px;
  color: green;
}

.error {
  margin-top: 10px;
  color: red;
}
</style>
