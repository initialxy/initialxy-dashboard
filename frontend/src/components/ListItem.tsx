import "./ListItem.css";
import { ButtonType, ButtonPosition } from "../components/Button";
import { defineComponent } from "vue";
import { emptyFunc, clx } from "../utils/Misc";
import Button from "../components/Button";

export default defineComponent({
  name: "ListItem",
  props: {
    autoMiddle: { type: Boolean },
    editable: { type: Boolean },
  },
  setup(props, ctx) {
    return () => (
      <div class={clx({ "ListItem": true, "auto_middle": props.autoMiddle })}>
        <div class="item_body">
          {(ctx.slots.default || emptyFunc)()}
        </div>
      </div>);
  }
});