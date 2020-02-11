<template>
  <button class="button submit" :disabled="processing" @click="createPayment"><slot></slot></button>
</template>

<script>
import axios from 'axios';
import StripeCardButton from './StripeCardButton';

export default {
  extends: StripeCardButton,
  props: {
    name: { type: String },
    email: { type: String },
    phone: { type: String }
  },
  methods: {
    createPayment() {
      // TODO
    }
  }
}
</script>

<style scoped>
</style>
