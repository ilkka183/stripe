<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import StripeClient from './stripe-client.js'

export default {
  name: 'StripeCard',
  props: {
    host: { type: String },
    name: { type: String },
    email: { type: String },
    phone: { type: String }
  },
  data() {
    return {
      client: new StripeClient(this.host)
    }
  },
  mounted() {
    this.client.name = this.name;
    this.client.email = this.email;
    this.client.phone = this.phone;
  }
}
</script>

<style scoped>
</style>
