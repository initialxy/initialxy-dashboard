import "./TasksView.css";
import { defineComponent, PropType } from "vue";
import { stx } from "../utils/Misc";
import { Tasks } from "../jsgen/Tasks";
import TaskListItem from "./TaskListItem";

const NUM_ITEMS_IN_VIEW = 8;

export default defineComponent({
  name: "TasksView",
  props: {
    tasksResp: { type: Object as () => Tasks | null },
    dateFormat: { type: String, required: true },
    editable: { type: Boolean },
    onMoveUp: { type: Function as PropType<(id: number) => void> },
    onMoveDown: { type: Function as PropType<(id: number) => void> },
    onDelete: { type: Function as PropType<(id: number) => void> },
  },
  setup(props) {
    const heightPct = Math.round(10000 / NUM_ITEMS_IN_VIEW) / 100;
    return () => (
      <div class="TasksView">
        {(props.tasksResp?.tasks || []).map((task, i) => (
          <TaskListItem
            key={task.id}
            task={task}
            style={stx({
              "height": (props.editable ? heightPct * 2 : heightPct) + "%",
            })}
            dateFormat={props.dateFormat}
            editable={props.editable}
            disableMoveUp={i === 0}
            disableMoveDown={i + 1 === props.tasksResp?.tasks?.length}
            onMoveUp={props.onMoveUp}
            onMoveDown={props.onMoveDown}
            onDelete={props.onDelete}
            disabled={task.id === 0}
          />
        ))}
      </div>);
  }
});