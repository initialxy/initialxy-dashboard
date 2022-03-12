import "./ListItem.css";
import { defineComponent } from "vue";
import { emptyFunc, clx } from "../utils/Misc";

export default defineComponent({
  name: "ListItem",
  props: { autoMiddle: { type: Boolean } },
  setup(props, ctx) {
    return () => (
      <div class={clx({ "ListItem": true, "auto_middle": props.autoMiddle })}>
        <div class="item_body">
          {(ctx.slots.default || emptyFunc)()}
        </div>
      </div>);
  }
});