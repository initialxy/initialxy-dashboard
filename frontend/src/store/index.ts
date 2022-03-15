import { createStore } from "vuex"
import { FrontEndConfig } from "../jsgen/FrontEndConfig";
import { isEditableHash } from "../utils/URL";
import { nullthrows } from "../utils/Misc";
import { Stock } from "../jsgen/Stock";
import { Stocks } from "../jsgen/Stocks";
import { Task } from "../jsgen/Task";
import { Tasks } from "../jsgen/Tasks";
import API from "../utils/API"

type GenericItem = {
  id: number,
  ord: number,
};

function findNeighbors(
  items: Array<GenericItem>,
  targetID: number,
): [GenericItem | null, GenericItem | null, GenericItem | null] {
  let prev = null;
  let cur = null;
  let next = null;
  const i = items.findIndex(item => item.id === targetID);
  if (i > -1) {
    cur = items[i];
    prev = i > 0 ? items[i - 1] : null;
    next = i < items.length - 1 ? items[i + 1] : null;
  }

  return [prev, cur, next];
}

function swapOrderMap(
  items: Array<GenericItem>,
  targetID: number,
  isMoveUp: boolean,
): Map<number, number> {
  const [prev, cur, next] = findNeighbors(
    items,
    targetID,
  );
  const orderMap = new Map();
  if (
    cur == null ||
    (isMoveUp && prev == null) ||
    (!isMoveUp && next == null)
  ) {
    return orderMap;
  }
  const other = nullthrows(isMoveUp ? prev : next);
  orderMap.set(other.id, cur.ord);
  orderMap.set(cur.id, other.ord);
  return orderMap;
}

// This is a mutating function.
function reorderItems(
  items: Array<GenericItem>,
  orderMap: Map<number, number>,
): void {
  for (const i of items) {
    if (orderMap.has(i.id)) {
      i.ord = orderMap.get(i.id) || 0;
    }
  }

  items.sort((a, b) => b.ord - a.ord);
}

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
    addStock(state, stock: Stock): void {
      if (state.stocksResp == null) {
        return;
      }
      state.stocksResp.stocks.unshift(stock);
    },
    reorderStocks(state, orderMap: Map<number, number>): void {
      if (state.stocksResp == null) {
        return;
      }
      reorderItems(state.stocksResp.stocks, orderMap);
    },
    deleteStock(state, id: number): void {
      if (state.stocksResp == null) {
        return;
      }
      state.stocksResp.stocks = state
        .stocksResp
        .stocks
        .filter(s => s.id !== id);
    },
    setTasks(state, tasksResp: Tasks): void {
      state.tasksResp = tasksResp;
    },
    addTask(state, task: Task): void {
      if (state.tasksResp == null) {
        return;
      }
      state.tasksResp.tasks.unshift(task);
    },
    reorderTasks(state, orderMap: Map<number, number>): void {
      if (state.tasksResp == null) {
        return;
      }
      reorderItems(state.tasksResp.tasks, orderMap);
    },
    deleteTask(state, id: number): void {
      if (state.tasksResp == null) {
        return;
      }
      state.tasksResp.tasks = state
        .tasksResp
        .tasks
        .filter(s => s.id !== id);
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
    async addStock(context): Promise<void> {
      const stocks = context.state.stocksResp?.stocks || [];
      if (stocks.some(s => s.id === 0 || s.symbol.trim() === "")) {
        // Do not insert new if there's an empty stock.
        return;
      }
      const maxOrd = stocks.length > 0 ?
        Math.max.apply(null, stocks.map(s => s.ord)) :
        0;
      context.commit(
        "addStock",
        new Stock({ id: 0, ord: maxOrd + 1, symbol: "" }),
      );
    },
    async moveUpStock(context, id: number): Promise<void> {
      context.commit(
        "reorderStocks",
        swapOrderMap(
          context.state.stocksResp?.stocks || [],
          id,
          true, // isMoveUp
        ),
      );
    },
    async moveDownStock(context, id: number): Promise<void> {
      context.commit(
        "reorderStocks",
        swapOrderMap(
          context.state.stocksResp?.stocks || [],
          id,
          false, // isMoveUp
        ),
      );
    },
    async deleteStock(context, id: number): Promise<void> {
      context.commit("deleteStock", id);
    },
    async fetchTasks(context): Promise<void> {
      const tasksResp = await API.genTasks();
      context.commit("setTasks", tasksResp);
    },
    async addTask(context): Promise<void> {
      const tasks = context.state.tasksResp?.tasks || [];
      if (tasks.some(t => t.id === 0 || t.desc.trim() === "")) {
        // Do not insert new if there's an empty task.
        return;
      }
      const maxOrd = tasks.length > 0 ?
        Math.max.apply(null, tasks.map(t => t.ord)) :
        0;
      context.commit("addTask", new Task({ id: 0, ord: maxOrd + 1, desc: "" }));
    },
    async moveUpTask(context, id: number): Promise<void> {
      context.commit(
        "reorderTasks",
        swapOrderMap(
          context.state.tasksResp?.tasks || [],
          id,
          true, // isMoveUp
        ),
      );
    },
    async moveDownTask(context, id: number): Promise<void> {
      context.commit(
        "reorderTasks",
        swapOrderMap(
          context.state.tasksResp?.tasks || [],
          id,
          false, // isMoveUp
        ),
      );
    },
    async deleteTask(context, id: number): Promise<void> {
      context.commit("deleteTask", id);
    },
  },
  modules: {
  }
})
