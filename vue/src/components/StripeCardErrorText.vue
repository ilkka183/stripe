<template>
  <div class="error">{{errorMessage}}</div>
</template>

<script>
export default {
  computed: {
    errorMessage() {
      return this.$parent.errorMessage;
    }
  }
}
</script>

<style scoped>
</style>
