<template>
  <div class=id>{{ client.paymentMethodId }}</div>
</template>

<script>
import StripeComponent from './StripeComponent'

export default {
  extends: StripeComponent,
}
</script>

<style scoped>
.id {
  font-family: 'Courier New', Courier, monospace;
  color: green;
}
</style>
