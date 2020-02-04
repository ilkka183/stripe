<template>
  <div>
    <div ref="cardElement"></div>
    <button class="button" :disabled="processing" @click="saveCard">Save Card</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    host: { type: String, required: true },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  data() {
    return {
      stripe: null,
      clientSecret: null,
      cardElement: null,
      processing: true
    }
  },
  mounted() {
    axios.get(this.host + '/card-setup')
      .then(response => {
        this.processing = false;
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
      this.processing = true;

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
        if (result.error) {
          window.console.log(result.error);
          this.showError(result.error.message);
          this.processing = false;
        } else {
          window.console.log(result);
          this.addPaymentMethod(result.setupIntent);
        }
      });
    },
    addPaymentMethod(setupIntent) {
      const data = {
        name: this.name,
        email: this.email,
        phone: this.phone,
        setupIntent
      }

      axios.post(this.host + '/payment-method/add', data)
        .then(response => {
          console.log(response.data.customer);
    
          const data = {
            customerId: response.data.customer.id,
            paymentMethodId: setupIntent.payment_method
          }

          this.$emit('setup', data);
          this.processing = false;
        })
    },
  }
}
</script>

<style>
</style>
