<script>
import StripeCardComponent from './StripeCardComponent';

export default {
  extends: StripeCardComponent,
  mounted() {
    this.group.elementMounted(this);
  }
}
</script>
