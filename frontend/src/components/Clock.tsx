import "./Clock.css";
import { defineComponent, ref, Ref } from "vue";
import moment from 'moment';
import { sleep } from "../utils/Misc";

const UPDATE_EVERY_MS = 60000;

async function updateLoop(timestamp: Ref<number>): Promise<void> {
  while (true) {
    await sleep(UPDATE_EVERY_MS - (Date.now() % UPDATE_EVERY_MS));
    timestamp.value = Date.now();
  }
}

export default defineComponent({
  name: "Clock",
  props: {
    timeFormat: { type: String, required: true },
    dateFormat: { type: String, required: true },
  },
  setup(props) {
    const timestamp = ref(Date.now());

    updateLoop(timestamp);

    return () => (
      <div class="Clock">
        <h1>{moment(timestamp.value).format(props.timeFormat)}</h1>
        <h2>{moment(timestamp.value).format(props.dateFormat)}</h2>
      </div>
    );
  }
});