<template>
  <button class="button submit" :disabled="$parent.processing" @click="createPayment"><slot></slot></button>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    name: { type: String },
    email: { type: String },
    phone: { type: String }
  },
  computed: {
    setupElement() {
      if (this.$parent.elements.length > 0)
        return this.$parent.elements[0].element;

      return null;
    }
  },
  methods: {
    createPayment() {
      // TODO
    }
  }
}
</script>

<style scoped>
</style>
