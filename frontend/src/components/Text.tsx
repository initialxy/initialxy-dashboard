import "./Text.css";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "Text",
  props: {
    value: { type: String },
    editable: { type: Boolean },
    onUpdate: { type: Function as PropType<(v: string) => void> }
  },
  setup(props) {
    return () => (
      <span class="Text">
        {props.value}
      </span>);
  }
});