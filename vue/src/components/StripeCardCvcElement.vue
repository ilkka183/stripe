<template>
  <div ref="element"></div>
</template>

<script>
import StripeCardBaseElement from './StripeCardBaseElement';

export default {
  extends: StripeCardBaseElement,
  computed: {
    elementName() {
      return 'cardCvc';
    }
  }
}
</script>

<style scoped>
</style>
