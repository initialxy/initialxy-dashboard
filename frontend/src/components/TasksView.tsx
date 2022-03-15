import "./TasksView.css";
import { defineComponent } from "vue";
import { stx } from "../utils/Misc";
import { Tasks } from "../jsgen/Tasks";
import ListItem from "./ListItem";
import TextField from "./TextField";
import DateField from "./DateField";

const NUM_ITEMS_IN_VIEW = 8;

export default defineComponent({
  name: "TasksView",
  props: {
    tasksResp: { type: Object as () => Tasks | null },
    dateFormat: { type: String, required: true },
    editable: { type: Boolean },
  },
  setup(props) {
    const heightPct = Math.round(10000 / NUM_ITEMS_IN_VIEW) / 100;
    return () => (
      <div class="TasksView">
        {(props.tasksResp?.tasks || []).map((task, i) => (
          <ListItem
            key={task.id}
            style={stx({
              "height": (props.editable ? heightPct * 2 : heightPct) + "%",
            })}
            autoMiddle
            editable={props.editable}
            disableMoveUp={i === 0}
            disableMoveDown={i + 1 === props.tasksResp?.tasks?.length}
          >
            <div class="row">
              <div class="desc">
                <TextField value={task.desc} editable={props.editable} />
              </div>
              <div class="date">
                <DateField
                  class="date_field"
                  value={task.timestamp}
                  dateFormat={props.dateFormat}
                  editable={props.editable}
                />
              </div>
            </div>
          </ListItem>
        ))}
      </div>);
  }
});