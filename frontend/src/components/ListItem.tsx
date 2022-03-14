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
      <div class={clx({
        "ListItem": true,
        "auto_middle": props.autoMiddle,
        "editable": props.editable,
      })}>
        {props.editable ? (
          <div class="move_position">
            <Button
              class="move_up"
              label="▲"
              buttonPosition={ButtonPosition.Top}
              circular
            />
            <Button
              class="move_down"
              label="▼"
              buttonPosition={ButtonPosition.Bottom}
              circular
            />
          </div>
        ) : null}
        <div class="item_body">
          {(ctx.slots.default || emptyFunc)()}
        </div>
        {props.editable ? (
          <div class="delete_container">
            <Button
              class="delete_item"
              label="-"
              buttonType={ButtonType.Delete}
              circular
            />
          </div>
        ) : null}
      </div>);
  }
});