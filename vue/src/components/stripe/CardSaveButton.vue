<template>
  <button class="button submit" :disabled="processing" @click="saveCard"><slot></slot></button>
</template>

<script>
import axios from 'axios';
import CardButton from './CardButton';

export default {
  extends: CardButton,
  methods: {
    saveCard() {
      this.beginWait();

      this.stripe.confirmCardSetup(
        this.group.clientSecret,
        {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              email: this.email,
              name: this.name,
              phone: this.phone,
            },
          },
      })
      .then(result => {
        if (result.error) {
          window.console.log(result.error);
          this.$emit('error', result.error.message);
          this.endWait();
        } else {
          window.console.log(result.setupIntent);
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

      axios.post(this.restPath + '/customer/create', data)
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

      axios.post(this.restPath + '/payment-method/attach', data)
        .then(response => {
          console.log(response.data);

          const data = {
            paymentMethodId: response.data.id,
            customerId: response.data.customer
          }

          this.$emit('saved', data);
          this.endWait();
        })
        .catch(error => {
          console.log(error.response);
          
          this.$emit('error', error.response.data.message);
          this.endWait();
        });
    },
  }
}
</script>

<style scoped>
</style>
