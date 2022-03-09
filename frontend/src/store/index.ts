import { createStore } from "vuex"
import API from "../utils/API"
import { FrontEndConfig } from "../jsgen/FrontEndConfig";
import { Stocks } from "../jsgen/Stocks";
import { Tasks } from "../jsgen/Tasks";

export default createStore({
  state: {
    config: null as FrontEndConfig | null,
    stocksResp: null as Stocks | null,
    tasksResp: null as Tasks | null,
  },
  mutations: {
    setConfig(state, config: FrontEndConfig): void {
      state.config = config;
    },
    setStocks(state, stocksResp: Stocks): void {
      state.stocksResp = stocksResp;
    },
    setTasks(state, tasksResp: Tasks): void {
      state.tasksResp = tasksResp;
    },
  },
  getters: {
  },
  actions: {
    async init(context): Promise<void> {
      const config = await API.genConfig();
      context.commit("setConfig", config);

      await Promise.all([
        context.dispatch("fetchStocks"),
        context.dispatch("fetchTasks"),
      ]);
    },
    async fetchStocks(context): Promise<void> {
      const stocksResp = await API.genStocks();
      context.commit("setStocks", stocksResp);
    },
    async fetchTasks(context): Promise<void> {
      const tasksResp = await API.genTasks();
      context.commit("setTasks", tasksResp);
    },
  },
  modules: {
  }
})
