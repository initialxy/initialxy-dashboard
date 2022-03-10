import "./TasksView.css";
import { DateTime } from "luxon";
import { defineComponent } from "vue";
import { Tasks } from "../jsgen/Tasks";
import ListItem from "./ListItem";

const NUM_ITEMS_IN_VIEW = 8;

export default defineComponent({
  name: "TasksView",
  props: {
    tasksResp: { type: Object as () => Tasks | null },
    dateFormat: { type: String, required: true },
  },
  setup(props) {
    const heightPct = Math.round(10000 / NUM_ITEMS_IN_VIEW) / 100;
    return () => (
      <div class="TasksView">
        {(props.tasksResp?.tasks || []).map(task => (
          <ListItem style={`height: ${heightPct}%;`} autoMiddle>
            <div class="row">
              <div class="desc">{task.desc}</div>
              {task.timestamp != null ?
                <div class="time">
                  {DateTime
                    .fromSeconds(task.timestamp)
                    .toFormat(props.dateFormat)}
                </div> :
                null
              }
            </div>
          </ListItem>
        ))}
      </div>);
  }
});