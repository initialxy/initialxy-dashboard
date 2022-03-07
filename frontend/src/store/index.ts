import { createStore } from "vuex"
import API from "../utils/API"
import { FrontEndConfig } from "../jsgen/FrontEndConfig";

export default createStore({
  state: {
    config: null as FrontEndConfig | null,
  },
  mutations: {
    setConfig(state, config: FrontEndConfig): void {
      state.config = config;
    },
  },
  getters: {
  },
  actions: {
    async init(context): Promise<void> {
      const config = await API.genConfig();
      context.commit("setConfig", config);
    }
  },
  modules: {
  }
})
