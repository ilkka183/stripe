<template>
  <div ref="element"></div>
</template>

<script>
import CardBaseElement from './CardBaseElement';

export default {
  extends: CardBaseElement,
  computed: {
    elementName() {
      return 'cardExpiry';
    }
  }
}
</script>

<style scoped>
</style>
