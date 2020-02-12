<script>
import CardComponent from './CardComponent';

export default {
  extends: CardComponent,
  mounted() {
    this.group.elementMounted(this);
  }
}
</script>
