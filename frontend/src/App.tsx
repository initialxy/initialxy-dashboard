import "./App.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import { defineComponent, onMounted } from "vue";
import store from "./store";
import Clock from "./components/Clock";
import { getConfigEndpoint } from "./utils/URL";

export default defineComponent({
  name: "App",
  setup() {
    onMounted(async () => {
      store.dispatch("init");
    });

    return () => (
      store.state.config == null ?
        <div class="App" /> :
        <div class="App">
          <Clock
            timeFormat={store.state.config.timeFormat}
            dateFormat={store.state.config.dateFormat}
          />
        </div>
    );
  }
});