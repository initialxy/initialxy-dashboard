import "./Button.css";
import { defineComponent, PropType } from "vue";

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
    onClick: { type: Function as PropType<() => void> },
  },
  setup(props) {
    const onClick = (_: Event) => {
      if (props.onClick == null) {
        return;
      }
      props.onClick();
    };
    return () => (
      <button
        class={`Button ${props.buttonType} ${props.buttonPosition}`}
        onClick={onClick}
      >
        {props.label}
      </button>
    );
  }
});