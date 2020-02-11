<template>
  <button class="button submit" :disabled="$parent.processing" @click="saveCard"><slot></slot></button>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    name: { type: String },
    email: { type: String },
    phone: { type: String }
  },
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
              name: this.name,
            },
          },
      })
      .then(result => {
        if (result.error) {
          window.console.log(result.error);
          this.$emit('error', result.error.message);
          this.$parent.endWait();
        } else {
          window.console.log(result);
          this.createCustomer(result.setupIntent);
        }
      });
    },
    createCustomer(setupIntent) {
      const data = {
        name: this.name,
        email: this.email,
        phone: this.phone
      }

      axios.post(this.$parent.host + '/customer/create', data)
        .then(response => {
          console.log(response.data);
          this.attachPaymentMethodTo(setupIntent.payment_method, response.data.id);
        })
        .catch(error => {
          console.log(error.response);
          this.$emit('error', error.response.data.message);
        });
    },
    attachPaymentMethodTo(paymentMethodId, customerId) {
      const data = {
        paymentMethodId,
        customerId,
      }

      axios.post(this.$parent.host + '/payment-method/attach', data)
        .then(response => {
          console.log(response.data);

          const data = {
            paymentMethodId: response.data.id,
            customerId: response.data.customer
          }

          this.$emit('saved', data);
          this.$parent.endWait();
        })
        .catch(error => {
          console.log(error.response);
          this.$emit('error', error.response.data.message);
          this.$parent.endWait();
        });
    },
  }
}
</script>

<style scoped>
</style>
