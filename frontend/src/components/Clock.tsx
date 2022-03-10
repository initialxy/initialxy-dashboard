import "./Clock.css";
import { DateTime } from "luxon";
import { defineComponent, ref, Ref, onMounted } from "vue";
import { sleep } from "../utils/Misc";

const UPDATE_EVERY_MS = 60000;

async function updateLoop(timestamp: Ref<number>): Promise<void> {
  while (true) {
    await sleep(
      UPDATE_EVERY_MS - (DateTime.now().toMillis() % UPDATE_EVERY_MS),
    );
    timestamp.value = DateTime.now().toMillis();
  }
}

export default defineComponent({
  name: "Clock",
  props: {
    timeFormat: { type: String, required: true },
    dateFormat: { type: String, required: true },
  },
  setup(props) {
    const timestamp = ref(DateTime.now().toMillis());

    onMounted(async () => {
      updateLoop(timestamp);
    });

    return () => (
      <div class="Clock">
        <div class="display">
          <span class="time">
            {DateTime.fromMillis(timestamp.value).toFormat(props.timeFormat)}
          </span>
          <span class="date">
            {DateTime.fromMillis(timestamp.value).toFormat(props.dateFormat)}
          </span>
        </div>
      </div>);
  }
});