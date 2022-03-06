import "./App.css";
import "@fortawesome/fontawesome-free/css/all.css";
import { defineComponent, onMounted, Transition } from "vue";

export default defineComponent({
  name: "App",
  setup() {
    return () => (
      <div class="App">
        Hello World!
      </div>
    );
  }
});