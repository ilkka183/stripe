<template>
  <div ref="element"></div>
</template>

<script>
export default {
  computed: {
    elementName() {
      return 'cardNumber';
    }
  },
  mounted() {
    this.$parent.elementMounted(this);
  }
}
</script>

<style scoped>
</style>
