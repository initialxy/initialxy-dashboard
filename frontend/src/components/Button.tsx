import "./Button.css";
import { defineComponent, PropType } from "vue";

export enum ButtonType {
  Add = "add",
  Edit = "edit",
  Delete = "delete",
}

export default defineComponent({
  name: "Button",
  props: {
    label: { type: String, required: true },
    buttonType: {
      type: String as PropType<ButtonType>,
      default: ButtonType.Edit,
    },
    onClick: { type: Function as PropType<() => void> },
  },
  setup(props) {
    const onClick = (e: Event) => {
      if (props.onClick == null) {
        return;
      }
      props.onClick();
    };
    return () => (
      <button class={`Button ${props.buttonType}`} onClick={onClick}>
        {props.label}
      </button>
    );
  }
});