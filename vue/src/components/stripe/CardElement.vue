<template>
  <div ref="element"></div>
</template>

<script>
import CardBaseElement from './CardBaseElement';

export default {
  extends: CardBaseElement,
  computed: {
    elementName() {
      return 'card';
    }
  }
}
</script>

<style scoped>
</style>
