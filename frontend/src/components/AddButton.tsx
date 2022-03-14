import "./AddButton.css";
import { defineComponent, PropType, ref } from "vue";
import { ButtonType, ButtonPosition } from "../components/Button";
import Button from "../components/Button";

export default defineComponent({
  name: "AddButton",
  props: {
    onAddStock: { type: Function as PropType<() => void> },
    onAddTask: { type: Function as PropType<() => void> },
  },
  setup(props) {
    const shouldShowDropDown = ref(false);

    const onClick = () => {
      shouldShowDropDown.value = !shouldShowDropDown.value;
    };

    const onAddStock = () => {
      shouldShowDropDown.value = false;
      if (props.onAddStock == null) {
        return;
      }
      props.onAddStock();
    };

    const onAddTask = () => {
      shouldShowDropDown.value = false;
      if (props.onAddTask == null) {
        return;
      }
      props.onAddTask();
    };

    return () => (
      <div class="AddButton">
        <Button
          class="add_button"
          buttonType={ButtonType.Add}
          label="+"
          onClick={onClick}
        />
        {shouldShowDropDown.value ? (
          <div class="drop_down">
            <Button
              class="add_stock"
              buttonType={ButtonType.Add}
              buttonPosition={ButtonPosition.Top}
              label="Add Stock"
              onClick={onAddStock}
            />
            <Button
              class="add_task"
              buttonType={ButtonType.Add}
              buttonPosition={ButtonPosition.Bottom}
              label="Add Task"
              onClick={onAddTask}
            />
          </div>
        ) : null}
      </div>
    );
  }
});