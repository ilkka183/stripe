<template>
  <div id="app">
    <h1>Stripe Payment</h1>
    <Customer />
  </div>
</template>

<script>
import Customer from './components/Customer.vue'

export default {
  name: 'app',
  components: {
    Customer
  }
}
</script>

<style>
.button {
  font-size: 16px;
  padding: 5px 10px;
  margin-right: 5px;
}
</style>
