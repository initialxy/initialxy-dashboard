import { createStore } from "vuex"
import { FrontEndConfig } from "../jsgen/FrontEndConfig";
import { Stocks } from "../jsgen/Stocks";
import { Task } from "../jsgen/Task";
import { Tasks } from "../jsgen/Tasks";
import {isEditableHash} from "../utils/URL";
import API from "../utils/API"

export default createStore({
  state: {
    config: null as FrontEndConfig | null,
    stocksResp: null as Stocks | null,
    tasksResp: null as Tasks | null,
    isEditable: false,
    shouldFadeEditButton: false,
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
    setEditable(state, isEditable: boolean): void {
      window.location.hash = isEditable ? "#e" : "#";
      state.isEditable = isEditable;
    },
    fadeEditButton(state): void {
      state.shouldFadeEditButton = true;
    },
  },
  getters: {
  },
  actions: {
    async init(context): Promise<void> {
      context.commit("setEditable", isEditableHash());

      const config = await API.genConfig();
      context.commit("setConfig", config);

      await Promise.all([
        context.dispatch("fetchStocks"),
        context.dispatch("fetchTasks"),
      ]);
    },
    async toggleEditable(context): Promise<void> {
      context.commit("setEditable", !context.state.isEditable);
    },
    async fadeEditButton(context): Promise<void> {
      context.commit("fadeEditButton");
    },
    async fetchStocks(context): Promise<void> {
      const stocksResp = await API.genStocks();
      context.commit("setStocks", stocksResp);
    },
    async fetchTasks(context): Promise<void> {
      const tasksResp = await API.genTasks();
      context.commit("setTasks", tasksResp);
    },
    async addTask(context, task: Task): Promise<void> {
      await API.genAddTask(task);
    },
  },
  modules: {
  }
})
