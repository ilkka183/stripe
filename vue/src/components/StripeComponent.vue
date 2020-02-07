<script>
export default {
  computed: {
    client() {
      const root = this.findParent('StripeCard');
      return root ? root.client : null;
    }
  },
  methods: {
    findParent(name) {
      let item = this.$parent;

      while (item) {
        if (item.$options.name == name)
          return item;

        item = item.$parent;
      }

      return null;
    }
  }
}
</script>
