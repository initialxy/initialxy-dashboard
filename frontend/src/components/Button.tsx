import "./Button.css";
import { defineComponent, PropType } from "vue";
import { clx } from "../utils/Misc";

export enum ButtonType {
  Add = "add",
  Edit = "edit",
  Delete = "delete",
}

export enum ButtonPosition {
  Standalone = "standalone",
  Top = "top",
  Right = "right",
  Bottom = "bottom",
  Left = "left",
}

export default defineComponent({
  name: "Button",
  props: {
    label: { type: String, required: true },
    buttonType: {
      type: String as PropType<ButtonType>,
      default: ButtonType.Edit,
    },
    buttonPosition: {
      type: String as PropType<ButtonPosition>,
      default: ButtonPosition.Standalone,
    },
    circular: { type: Boolean },
    onClick: { type: Function as PropType<() => void> },
  },
  setup(props) {
    const onClick = (_: Event) => {
      if (props.onClick == null) {
        return;
      }
      props.onClick();
    };
    return () => {
      const cls = `Button ${props.buttonType} ${props.buttonPosition} `;
      return (
        <button
          class={cls + clx({
            "circular": props.circular,
          })}
          onClick={onClick}
        >
          {props.label}
        </button>
      );
    };
  }
});