<template>
  <button class="button submit" :disabled="$parent.processing" @click="saveCard"><slot></slot></button>
</template>

<script>
import axios from 'axios';
import StripeComponent from './StripeComponent'

export default {
  extends: StripeComponent,
  computed: {
    setupElement() {
      if (this.$parent.elements.length > 0)
        return this.$parent.elements[0].element;

      return null;
    }
  },
  methods: {
    saveCard() {
      this.$parent.beginWait();

      this.$parent.stripe.confirmCardSetup(
        this.$parent.clientSecret,
        {
          payment_method: {
            card: this.setupElement,
            billing_details: {
              name: this.$parent.client.name,
            },
          },
      })
      .then(result => {
        if (result.error) {
          window.console.log(result.error);
          this.$parent.setupError(result.error.message);
          this.$parent.endWait();
        } else {
          window.console.log(result);
          this.createCustomer(result.setupIntent);
        }
      });
    },
    createCustomer(setupIntent) {
      const data = {
        name: this.$parent.client.name,
        email: this.$parent.client.email,
        phone: this.$parent.client.phone
      }

      axios.post(this.$parent.client.host + '/customer/create', data)
        .then(response => {
          console.log(response.data.customer);
          this.attachPaymentMethodTo(setupIntent.payment_method, response.data.customer.id);
        })
        .catch(error => {
          console.log(error.response);
          this.$parent.setupError(error.response.data.message);
        });
    },
    attachPaymentMethodTo(paymentMethodId, customerId) {
      const data = {
        paymentMethodId,
        customerId,
      }

      axios.post(this.$parent.client.host + '/payment-method/attach', data)
        .then(response => {
          const data = {
            paymentMethodId: response.data.paymentMethodId,
            customerId: response.data.customerId
          }

          console.log(data);
          this.client.customerId = data.customerId;
          this.client.paymentMethodId = data.paymentMethodId;

          this.$parent.endWait();
        })
        .catch(error => {
          console.log(error.response);
          this.$parent.setupError(error.response.data.message);
        });
    },
  }
}
</script>

<style scoped>
</style>
