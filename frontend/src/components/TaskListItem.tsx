import "./TaskListItem.css";
import { defineComponent, PropType } from "vue";
import { Task } from "../jsgen/Task";
import ListItem from "./ListItem";
import TextField from "./TextField";
import DateField from "./DateField";

export default defineComponent({
  name: "TaskListItem",
  props: {
    task: { type: Task, required: true },
    dateFormat: { type: String, required: true },
    editable: { type: Boolean },
    disableMoveUp: { type: Boolean },
    disableMoveDown: { type: Boolean },
    disabled: {type: Boolean},
    onMoveUp: { type: Function as PropType<(id: number) => void> },
    onMoveDown: { type: Function as PropType<(id: number) => void> },
    onDelete: { type: Function as PropType<(id: number) => void> },
  },
  setup(props) {
    const onMoveUp = () => {
      props.onMoveUp && props.onMoveUp(props.task.id);
    }
    const onMoveDown = () => {
      props.onMoveDown && props.onMoveDown(props.task.id);
    }
    const onDelete = () => {
      props.onDelete && props.onDelete(props.task.id);
    }

    return () => (
      <ListItem
        class="TaskListItem"
        editable={props.editable}
        disableMoveUp={props.disableMoveUp}
        disableMoveDown={props.disableMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
        disabled={props.disabled}
        autoMiddle
      >
        <div class="row">
          <div class="desc">
            <TextField
              value={props.task.desc}
              editable={props.editable && !props.disabled}
            />
          </div>
          <div class="date">
            <DateField
              class="date_field"
              value={props.task.timestamp}
              dateFormat={props.dateFormat}
              editable={props.editable && !props.disabled}
            />
          </div>
        </div>
      </ListItem>
    );
  }
});