<template>
  <div id="app">
    <h1>Stripe Payment</h1>
    <Payment />
  </div>
</template>

<script>
import Payment from './components/Payment.vue'

export default {
  name: 'app',
  components: {
    Payment
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
