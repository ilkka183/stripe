<template>
  <div>
    <StripeCard ref="card" host="http://localhost:3000" name="Ilkka Salmenius" email="ilkka.salmennius@gmail.com" phone="050 61698" :amount="195">
      <div class="group">
        <table>
          <tr><td>Customer:</td><td><StripeCustomerIdText /></td></tr>
          <tr><td>Name:</td><td><StripeNameEdit /></td></tr>
          <tr><td>Name:</td><td><StripeEmailEdit /></td></tr>
          <tr><td>Name:</td><td><StripePhoneEdit /></td></tr>
        </table>
        <StripeCardGroup>
          <div v-if="true">
            <StripeCardElement />
          </div>
          <div v-else>
            <StripeCardNumberElement />
            <StripeCardExpiryElement />
            <StripeCardCvcElement />
          </div>
          <StripeCardSaveButton>Save Card</StripeCardSaveButton>
          <StripeCardErrorText />
        </StripeCardGroup>
      </div>
      <div v-show="true || customerId" class="group">
        <table>
          <tr><td>Payment Method:</td><td><StripePaymentMethodIdText /></td></tr>
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
          <button class="button" :disabled="!client || client.processing || client.captureNeeded" @click="createPayment">Create Payment</button>
          <template v-if="client && client.captureNeeded">
            <button class="button" :disabled="!client || client.processing" @click="capturePayment">Capture Payment</button>
            <button class="button" :disabled="!client || client.processing" @click="cancelPayment">Cancel Payment</button>
          </template>
        </div>
        <div vlass="messages">
          <div v-if="client" class="success">{{ client.success }}</div>
          <div v-if="client" class="error">{{ client.error }}</div>
        </div>
      </div>
    </StripeCard>
  </div>
</template>

<script>
import StripeCustomerIdText from './StripeCustomerIdText'
import StripePaymentMethodIdText from './StripePaymentMethodIdText'
import StripeNameEdit from './StripeNameEdit'
import StripeEmailEdit from './StripeEmailEdit'
import StripePhoneEdit from './StripePhoneEdit'
import StripeCard from './StripeCard'
import StripeCardGroup from './StripeCardGroup'
import StripeCardElement from './StripeCardElement'
import StripeCardNumberElement from './StripeCardNumberElement'
import StripeCardExpiryElement from './StripeCardExpiryElement'
import StripeCardCvcElement from './StripeCardCvcElement'
import StripeCardSaveButton from './StripeCardSaveButton'
import StripeCardErrorText from './StripeCardErrorText'

export default {
  components: {
    StripeCustomerIdText,
    StripePaymentMethodIdText,
    StripeNameEdit,
    StripeEmailEdit,
    StripePhoneEdit,
    StripeCard,
    StripeCardGroup,
    StripeCardElement,
    StripeCardNumberElement,
    StripeCardExpiryElement,
    StripeCardCvcElement,
    StripeCardSaveButton,
    StripeCardErrorText
  },
  data() {
    return {
      amount: 195,
      currency: 'eur',
      captureMethod: 'automatic'
    }
  },
  computed: {
    client() {
      return this.$refs.card ? this.$refs.card.client : null;
    },
    customerId() {
      return this.client ? this.client.customerId : null;
    }
  },
  methods: {
    createPayment() {
      this.client.createPayment(this.amount, this.currency, this.captureMethod);
    },
    capturePayment() {
      this.client.capturePayment();
    },
    cancelPayment() {
      this.client.cancelPayment();
    }
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

.success {
  margin-top: 10px;
  color: green;
}

.error {
  margin-top: 10px;
  color: red;
}
</style>
