import "./ListItem.css";
import { ButtonType, ButtonPosition } from "../components/Button";
import { defineComponent, PropType } from "vue";
import { emptyFunc, clx } from "../utils/Misc";
import Button from "../components/Button";

export default defineComponent({
  name: "ListItem",
  props: {
    autoMiddle: { type: Boolean },
    editable: { type: Boolean },
    disabled: { type: Boolean },
    disableMoveUp: { type: Boolean },
    disableMoveDown: { type: Boolean },
    onMoveUp: { type: Function as PropType<() => void> },
    onMoveDown: { type: Function as PropType<() => void> },
    onDelete: { type: Function as PropType<() => void> },
  },
  setup(props, ctx) {
    return () => (
      <div class={clx({
        "ListItem": true,
        "auto_middle": props.autoMiddle,
        "editable": props.editable,
      })}>
        <div class="item_container">
          {props.editable ? (
            <div class="move_position">
              <Button
                class="move_up"
                label="↑"
                buttonPosition={ButtonPosition.Top}
                circular
                disabled={props.disableMoveUp || props.disabled}
                onClick={props.onMoveUp}
              />
              <Button
                class="move_down"
                label="↓"
                buttonPosition={ButtonPosition.Bottom}
                circular
                disabled={props.disableMoveDown || props.disabled}
                onClick={props.onMoveDown}
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
                label="➖"
                buttonType={ButtonType.Delete}
                circular
                onClick={props.onDelete}
                disabled={props.disabled}
              />
            </div>
          ) : null}
        </div>
      </div>);
  }
});