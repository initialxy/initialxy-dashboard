import { createStore } from "vuex"
import { debounceBatch } from "../utils/Misc";
import { FrontEndConfig } from "../jsgen/FrontEndConfig";
import { isEditableHash } from "../utils/URL";
import { nullthrows } from "../utils/Misc";
import { Stock } from "../jsgen/Stock";
import { Stocks } from "../jsgen/Stocks";
import { Task } from "../jsgen/Task";
import { Tasks } from "../jsgen/Tasks";
import API from "../utils/API"

const SHORT_DEBOUNCE = 2000;

type GenericItem = {
  id: number,
  ord: number,
};

function findByID<T extends GenericItem>(
  items: Array<T> | null | undefined,
  id: number,
): T | null {
  return items?.find(i => i.id === id) || null;
}

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

const saveDeleteStockDebounced = debounceBatch((stocks: Array<Stock>) => {
  store.dispatch("saveDeleteStocks", stocks);
}, SHORT_DEBOUNCE);

const saveUpdateStockDebounced = debounceBatch((ids: Array<number>) => {
  store.dispatch("saveUpdateStocks", ids);
}, SHORT_DEBOUNCE);

const saveDeleteTaskDebounced = debounceBatch((tasks: Array<Task>) => {
  store.dispatch("saveDeleteTasks", tasks);
}, SHORT_DEBOUNCE);

const saveUpdateTaskDebounced = debounceBatch((ids: Array<number>) => {
  store.dispatch("saveUpdateTasks", ids);
}, SHORT_DEBOUNCE);

const store = createStore({
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
    assignNewStockID(state, newID: number): void {
      const newStock = findByID(state.stocksResp?.stocks, 0);
      if (newStock != null) {
        newStock.id = newID;
      }
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
    changeStock(state, stockCopy: Stock): void {
      const stock = findByID(state.stocksResp?.stocks, stockCopy.id);
      if (stock != null) {
        stock.symbol = stockCopy.symbol;
      }
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
    assignNewTaskID(state, newID: number): void {
      const newTask = findByID(state.tasksResp?.tasks, 0);
      if (newTask != null) {
        newTask.id = newID;
      }
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
    changeTask(state, taskCopy: Task): void {
      const task = findByID(state.tasksResp?.tasks, taskCopy.id);
      if (task != null) {
        task.desc = taskCopy.desc;
        task.timestamp = taskCopy.timestamp;
      }
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
      try {
        const stocksResp = await API.genStocks();
        context.commit("setStocks", stocksResp);
      } catch (e: any) {
        console.error(e);
      }
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
      let newStock = new Stock({ id: 0, ord: maxOrd + 1, symbol: "" });
      context.commit(
        "addStock",
        new Stock({ id: 0, ord: maxOrd + 1, symbol: "" }),
      );
      newStock = await API.genAddStock(newStock);
      context.commit("assignNewStockID", newStock.id);
    },
    async moveUpStock(context, id: number): Promise<void> {
      const orderMap = swapOrderMap(
        context.state.stocksResp?.stocks || [],
        id,
        true, // isMoveUp
      );
      context.commit(
        "reorderStocks",
        orderMap,
      );
      orderMap.forEach((_, k) => {
        saveUpdateStockDebounced(k);
      });
    },
    async moveDownStock(context, id: number): Promise<void> {
      const orderMap = swapOrderMap(
        context.state.stocksResp?.stocks || [],
        id,
        false, // isMoveUp
      );
      context.commit(
        "reorderStocks",
        orderMap,
      );
      orderMap.forEach((_, k) => {
        saveUpdateStockDebounced(k);
      });
    },
    async deleteStock(context, id: number): Promise<void> {
      const toBeDeleted = findByID(context.state.stocksResp?.stocks, id);
      if (toBeDeleted == null) {
        return;
      }

      context.commit("deleteStock", id);
      saveDeleteStockDebounced(toBeDeleted);
    },
    async saveDeleteStocks(context, stocks: Array<Stock>): Promise<void> {
      await API.genDeleteStocks(new Stocks({ stocks }));
    },
    async changeStock(context, stockCopy: Stock): Promise<void> {
      context.commit("changeStock", stockCopy);
      saveUpdateStockDebounced(stockCopy.id);
    },
    async saveUpdateStocks(context, ids: Array<number>): Promise<void> {
      const lookup = new Set(ids);
      const stocks = context.state
        .stocksResp?.stocks?.filter(s => lookup.has(s.id));
      if (stocks == null || stocks.length === 0) {
        return;
      }
      await API.genUpdateStocks(new Stocks({ stocks }));
    },
    async fetchTasks(context): Promise<void> {
      try {
        const tasksResp = await API.genTasks();
        context.commit("setTasks", tasksResp);
      } catch (e: any) {
        console.error(e);
      }
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
      let newTask = new Task({ id: 0, ord: maxOrd + 1, desc: "" });
      context.commit("addTask", newTask);
      newTask = await API.genAddTask(newTask);
      context.commit("assignNewTaskID", newTask.id);
    },
    async moveUpTask(context, id: number): Promise<void> {
      const orderMap = swapOrderMap(
        context.state.tasksResp?.tasks || [],
        id,
        true, // isMoveUp
      );
      context.commit(
        "reorderTasks",
        orderMap,
      );
      orderMap.forEach((_, k) => {
        saveUpdateTaskDebounced(k);
      });
    },
    async moveDownTask(context, id: number): Promise<void> {
      const orderMap = swapOrderMap(
        context.state.tasksResp?.tasks || [],
        id,
        false, // isMoveUp
      );
      context.commit(
        "reorderTasks",
        orderMap,
      );
      orderMap.forEach((_, k) => {
        saveUpdateTaskDebounced(k);
      });
    },
    async deleteTask(context, id: number): Promise<void> {
      const toBeDeleted = findByID(context.state.tasksResp?.tasks, id);
      if (toBeDeleted == null) {
        return;
      }
      context.commit("deleteTask", id);
      saveDeleteTaskDebounced(toBeDeleted);
    },
    async saveDeleteTasks(context, tasks: Array<Task>): Promise<void> {
      await API.genDeleteTasks(new Tasks({ tasks }));
    },
    async changeTask(context, taskCopy: Task): Promise<void> {
      context.commit("changeTask", taskCopy);
      saveUpdateTaskDebounced(taskCopy.id);
    },
    async saveUpdateTasks(context, ids: Array<number>): Promise<void> {
      const lookup = new Set(ids);
      const tasks = context.state
        .tasksResp?.tasks?.filter(s => lookup.has(s.id));
      if (tasks == null || tasks.length === 0) {
        return;
      }
      await API.genUpdateTasks(new Tasks({ tasks }));
    },
  },
  modules: {
  }
})

export default store;