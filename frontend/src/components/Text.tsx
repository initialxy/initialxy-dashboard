import "./Text.css";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "Text",
  props: {
    value: { type: String },
    editable: { type: Boolean },
    onInput: { type: Function as PropType<(v: string) => void> },
  },
  setup(props) {
    const onInput = (e: Event) => {
      if (e.target == null || props.onInput == null) {
        return;
      }
      props.onInput((e.target as HTMLSpanElement).textContent || "");
    };
    return () => props.editable ? (
      <span
        class="Text editable"
        role="textbox"
        contenteditable
        onInput={onInput}
      >
        {props.value}
      </span>
    ) : (
      <span class="Text">
        {props.value}
      </span>
    );
  }
});