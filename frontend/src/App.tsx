import "./App.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import { DateTime } from "luxon";
import { defineComponent, onMounted } from "vue";
import { sleep } from "./utils/Misc";
import Clock from "./components/Clock";
import StocksView from "./components/StocksView";
import store from "./store";
import TasksView from "./components/TasksView";

const UPDATE_EVERY_MS = 60000;

async function genUpdateLoop(): Promise<void> {
  while (true) {
    await sleep(
      UPDATE_EVERY_MS - (DateTime.now().toMillis() % UPDATE_EVERY_MS),
    );
    await Promise.all([
      store.dispatch("fetchStocks"),
      store.dispatch("fetchTasks"),
    ]);
  }
}

export default defineComponent({
  name: "App",
  setup() {
    onMounted(async () => {
      await store.dispatch("init");
      genUpdateLoop();
    });

    return () => store.state.config != null ? (
      <div class="App">
        <Clock
          timeFormat={store.state.config.timeFormat}
          dateFormat={store.state.config.dateFormat}
        />
        <div class="contents">
          <div class="stocks_container">
            <StocksView
              stocksResp={store.state.stocksResp}
              numPoints={store.state.config.numDataPointsInDay}
            />
          </div>
          <div class="tasks_container">
            <TasksView
              tasksResp={store.state.tasksResp}
              dateFormat={store.state.config.dateShortFormat}
            />
          </div>
        </div>
      </div>
    ) : <div class="App" />;
  }
});