import "./ListItem.css";
import { defineComponent } from "vue";
import { emptyFunc } from "../utils/Misc";

export default defineComponent({
  name: "ListItem",
  setup(_, ctx) {
    return () => (
      <div class="ListItem">
        <div class="arrow" />
        <div class="item_body">
          {(ctx.slots.default || emptyFunc)()}
        </div>
      </div>);
  }
});