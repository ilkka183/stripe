<template>
  <input type="text" size="40" v-model="client.phone">
</template>

<script>
import StripeComponent from './StripeComponent'

export default {
  extends: StripeComponent,
}
</script>

<style scoped>
</style>
