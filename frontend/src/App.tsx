import "./App.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import { ButtonType } from "./components/Button";
import { clx } from "./utils/Misc";
import { DateTime } from "luxon";
import { defineComponent, onMounted } from "vue";
import { sleep } from "./utils/Misc";
import { Stock } from "./jsgen/Stock";
import { Task } from "./jsgen/Task";
import AddButton from "./components/AddButton";
import Button from "./components/Button";
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
    // Don't auto refresh when we are in edit mode to avoid overriding user
    // inputs and reduce thrash.
    if (!store.state.isEditable) {
      await Promise.all([
        store.dispatch("fetchStocks"),
        store.dispatch("fetchTasks"),
      ]);
    }
  }
}

async function fadeEditButtonAfterWait(): Promise<void> {
  await sleep(2000);
  store.dispatch("fadeEditButton");
}

export default defineComponent({
  name: "App",
  setup() {
    onMounted(async () => {
      await store.dispatch("init");
      // Don't await the followings.
      genUpdateLoop();
      fadeEditButtonAfterWait();
    });

    const onToggleEdit = () => {
      store.dispatch("toggleEditable");
    }

    const onAddStock = () => {
      store.dispatch("addStock");
    }

    const onMoveUpStock = (id: number) => {
      store.dispatch("moveUpStock", id);
    }

    const onMoveDownStock = (id: number) => {
      store.dispatch("moveDownStock", id);
    }

    const onDeleteStock = (id: number) => {
      store.dispatch("deleteStock", id);
    }

    const onChangeStock = (stockCopy: Stock) => {
      store.dispatch("changeStock", stockCopy);
    }

    const onAddTask = () => {
      store.dispatch("addTask");
    }

    const onMoveUpTask = (id: number) => {
      store.dispatch("moveUpTask", id);
    }

    const onMoveDownTask = (id: number) => {
      store.dispatch("moveDownTask", id);
    }

    const onDeleteTask = (id: number) => {
      store.dispatch("deleteTask", id);
    }

    const onChangeTask = (taskCopy: Task) => {
      store.dispatch("changeTask", taskCopy);
    }

    return () => store.state.config != null ? (
      <div class="App">
        <div class="header">
          <Clock
            timeFormat={store.state.config.timeFormat}
            dateFormat={store.state.config.dateFormat}
          />
          <Button
            class={clx({
              "edit_toggle": true,
              "fade": store.state.shouldFadeEditButton,
            })}
            label="Edit dashboard"
            buttonType={ButtonType.Edit}
            onClick={onToggleEdit}
          />
          {
            store.state.isEditable ? (
              <AddButton
                class="add_items_button"
                onAddStock={onAddStock}
                onAddTask={onAddTask}
              />
            ) : null
          }
        </div>
        <div class="contents">
          <div class="stocks_container">
            <StocksView
              stocksResp={store.state.stocksResp}
              numPoints={store.state.config.numDataPointsInDay}
              editable={store.state.isEditable}
              onMoveUp={onMoveUpStock}
              onMoveDown={onMoveDownStock}
              onDelete={onDeleteStock}
              onChange={onChangeStock}
            />
          </div>
          <div class="tasks_container">
            <TasksView
              tasksResp={store.state.tasksResp}
              dateFormat={store.state.config.dateShortFormat}
              editable={store.state.isEditable}
              onMoveUp={onMoveUpTask}
              onMoveDown={onMoveDownTask}
              onDelete={onDeleteTask}
              onChange={onChangeTask}
            />
          </div>
        </div>
      </div>
    ) : <div class="App" />;
  }
});