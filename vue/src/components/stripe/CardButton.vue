<script>
import CardComponent from './CardComponent';

export default {
  extends: CardComponent,
  props: {
    name: { type: String },
    email: { type: String },
    phone: { type: String }
  },
  computed: {
    cardElement() {
      if (this.group.elements.length > 0)
        return this.group.elements[0].element;

      return null;
    },
    restPath() {
      return this.group ? this.group.restPath : null;
    },
    stripe() {
      return this.group ? this.group.stripe : null;
    },
    processing() {
      return this.group && this.group.processing;
    }
  },
  methods: {
    beginWait() {
      if (this.group)
        this.group.beginWait();
    },
    endWait() {
      if (this.group)
        this.group.endWait();
    },
  }
}
</script>
