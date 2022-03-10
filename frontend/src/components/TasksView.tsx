import "./TasksView.css";
import { DateTime } from "luxon";
import { defineComponent } from "vue";
import { Tasks } from "../jsgen/Tasks";
import ListItem from "./ListItem";

export default defineComponent({
  name: "TasksView",
  props: {
    tasksResp: { type: Object as () => Tasks | null },
  },
  setup(props) {

    return () => (
      <div class="TasksView">
        {(props.tasksResp?.tasks || []).map(task => (
          <ListItem>{task.desc} {task.ord}</ListItem>
        ))}
      </div>);
  }
});