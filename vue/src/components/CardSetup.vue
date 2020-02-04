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
    axios.get(this.host + '/setup')
      .then(response => {
        this.processing = false;
        console.log(response.data);

        this.clientSecret = response.data.client_secret;

        /* eslint-disable */
        this.stripe = Stripe(response.data.publishableKey);
        /* eslint-enable */
        const elements = this.stripe.elements();

        var style = {
          base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
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

      axios.post(this.host + '/customer/create', data)
        .then(response => {
          console.log(response.data.customer);
          this.attachPaymentMethodTo(setupIntent.payment_method, response.data.customer.id);
        });
    },
    attachPaymentMethodTo(paymentMethodId, customerId) {
      const data = {
        paymentMethodId,
        customerId,
      }

      axios.post(this.host + '/payment-method/attach', data)
        .then(response => {
          const data = {
            paymentMethodId: response.data.paymentMethodId,
            customerId: response.data.customerId
          }

          console.log(data);
          this.$emit('setup', data);
          this.processing = false;
        })
    },
  }
}
</script>

<style scoped>
/**
 * The CSS shown here will not be introduced in the Quickstart guide, but shows
 * how you can use CSS to style your Element's container.
 */
.StripeElement {
  box-sizing: border-box;

  height: 40px;

  padding: 10px 12px;

  border: 1px solid transparent;
  border-radius: 4px;
  background-color: white;

  box-shadow: 0 1px 3px 0 #e6ebf1;
  -webkit-transition: box-shadow 150ms ease;
  transition: box-shadow 150ms ease;
}

.StripeElement--focus {
  box-shadow: 0 1px 3px 0 #cfd7df;
}

.StripeElement--invalid {
  border-color: #fa755a;
}

.StripeElement--webkit-autofill {
  background-color: #fefde5 !important;
}
</style>
