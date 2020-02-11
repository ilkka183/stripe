<script>
export default {
  computed: {
    group() {
      return this.parentByName('StripeCardGroup');
    }
  },
  methods: {
    parentByName(name) {
      let parent = this.$parent

      while (parent) {
        if (parent.$options.name === name)
          return parent;

        parent = parent.$parent
      }

      return null;
    },    
  },
  render() { return null; }
}
</script>
