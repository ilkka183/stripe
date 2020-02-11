<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'StripeCardGroup',
  props: {
    host: { type: String, required: true }
  },
  data() {
    return {
      stripe: null,
      clientSecret: null,
      elements: [],
      processing: true
    }
  },
  mounted() {
    this.beginWait();

    axios.get(this.host + '/setup')
      .then(response => {
        this.endWait();
        console.log(response.data);
        this.clientSecret = response.data.setupIntent.client_secret;

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

        for (const element of this.elements) {
          element.element = elements.create(element.component.elementName, { style });
          element.element.mount(element.component.$refs.element);
        }
      });
  },
  methods: {
    elementMounted(component) {
      const element = {
        component,
        element: null
      }

      this.elements.push(element);
    },
    beginWait() {
      this.processing = true;
    },
    endWait() {
      this.processing = false;
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
