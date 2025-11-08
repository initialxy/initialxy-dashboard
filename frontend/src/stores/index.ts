import { debounceBatch } from '../utils/Misc'
import { defineStore } from 'pinia'
import { FrontEndConfig } from '../jsgen/FrontEndConfig'
import { isEditableHash } from '../utils/URL'
import { nullthrows } from '../utils/Misc'
import { ref, computed } from 'vue'
import { Stock } from '../jsgen/Stock'
import { Stocks } from '../jsgen/Stocks'
import { Task } from '../jsgen/Task'
import { Tasks } from '../jsgen/Tasks'
import API from '../utils/API'

const SHORT_DEBOUNCE = 2000

type GenericItem = {
  id: number
  ord: number
}

function findByID<T extends GenericItem>(items: Array<T> | null | undefined, id: number): T | null {
  return items?.find((i) => i.id === id) || null
}

function findNeighbors(
  items: Array<GenericItem>,
  targetID: number,
): [GenericItem | null, GenericItem | null, GenericItem | null] {
  let prev: GenericItem | null = null
  let cur: GenericItem | null = null
  let next: GenericItem | null = null
  const i = items.findIndex((item) => item.id === targetID)
  if (i > -1) {
    cur = items[i] || null
    prev = items[i - 1] || null
    next = items[i + 1] || null
  }

  return [prev, cur, next]
}

function swapOrderMap(
  items: Array<GenericItem>,
  targetID: number,
  isMoveUp: boolean,
): Map<number, number> {
  const [prev, cur, next] = findNeighbors(items, targetID)
  const orderMap = new Map()
  if (cur == null || (isMoveUp && prev == null) || (!isMoveUp && next == null)) {
    return orderMap
  }
  const other = nullthrows(isMoveUp ? prev : next)
  orderMap.set(other.id, cur.ord)
  orderMap.set(cur.id, other.ord)
  return orderMap
}

// This is a mutating function.
function reorderItems(items: Array<GenericItem>, orderMap: Map<number, number>): void {
  for (const i of items) {
    if (orderMap.has(i.id)) {
      i.ord = orderMap.get(i.id) || 0
    }
  }

  items.sort((a, b) => b.ord - a.ord)
}

// Define the Pinia store
export const useStore = defineStore('dashboard', () => {
  // State
  const config = ref<FrontEndConfig | null>(null)
  const stocksResp = ref<Stocks | null>(null)
  const tasksResp = ref<Tasks | null>(null)
  const isEditable = ref(false)
  const shouldFadeEditButton = ref(false)

  // Getters (computed properties)
  const getStocks = computed(() => stocksResp.value?.stocks || [])
  const getTasks = computed(() => tasksResp.value?.tasks || [])

  // Actions
  const init = async () => {
    isEditable.value = isEditableHash()
    config.value = await API.genConfig()

    await Promise.all([fetchStocks(), fetchTasks()])
  }

  const saveDeleteStockDebounced = debounceBatch(
    (stocks: Stock[]) => API.genDeleteStocks(new Stocks({ stocks })),
    SHORT_DEBOUNCE,
  )

  const saveUpdateStockDebounced = debounceBatch(async (ids: number[]) => {
    const lookup = new Set(ids)
    const stocks = stocksResp.value?.stocks?.filter((s) => lookup.has(s.id))
    if (stocks == null || stocks.length === 0) {
      return
    }
    await API.genUpdateStocks(new Stocks({ stocks }))
  }, SHORT_DEBOUNCE)

  const saveDeleteTaskDebounced = debounceBatch(
    (tasks: Task[]) => API.genDeleteTasks(new Tasks({ tasks })),
    SHORT_DEBOUNCE,
  )

  const saveUpdateTaskDebounced = debounceBatch(async (ids: number[]) => {
    const lookup = new Set(ids)
    const tasks = tasksResp.value?.tasks?.filter((s) => lookup.has(s.id))
    if (tasks == null || tasks.length === 0) {
      return
    }
    await API.genUpdateTasks(new Tasks({ tasks }))
  }, SHORT_DEBOUNCE)

  const toggleEditable = () => {
    isEditable.value = !isEditable.value
    window.location.hash = isEditable.value ? '#e' : '#'
  }

  const fadeEditButton = () => {
    shouldFadeEditButton.value = true
  }

  const fetchStocks = async () => {
    try {
      stocksResp.value = await API.genStocks()
    } catch (e) {
      console.error(e)
    }
  }

  const fetchTasks = async () => {
    try {
      tasksResp.value = await API.genTasks()
    } catch (e) {
      console.error(e)
    }
  }

  const addStock = async () => {
    const stocks = stocksResp.value?.stocks || []
    if (stocks.some((s) => s.id === 0 || s.symbol.trim() === '')) {
      // Do not insert new if there's an empty stock.
      return
    }
    const maxOrd =
      stocks.length > 0
        ? Math.max.apply(
            null,
            stocks.map((s) => s.ord),
          )
        : 0
    let newStock = new Stock({ id: 0, ord: maxOrd + 1, symbol: '' })

    // Add the new stock to the beginning of the array
    if (stocksResp.value) {
      stocksResp.value.stocks.unshift(newStock)
    }

    // Call API to create the stock
    newStock = await API.genAddStock(newStock)

    // Update the ID of the newly created stock
    if (stocksResp.value && stocksResp.value.stocks.length > 0) {
      const firstStock = stocksResp.value.stocks[0]
      if (firstStock?.id === 0) {
        firstStock.id = newStock.id
      }
    }
  }

  const moveUpStock = async (id: number) => {
    const stocks = stocksResp.value?.stocks || []
    const orderMap = swapOrderMap(stocks, id, true)

    if (stocksResp.value) {
      reorderItems(stocksResp.value.stocks, orderMap)
    }

    orderMap.forEach((_, k) => {
      saveUpdateStockDebounced(k)
    })
  }

  const moveDownStock = async (id: number) => {
    const stocks = stocksResp.value?.stocks || []
    const orderMap = swapOrderMap(stocks, id, false)

    if (stocksResp.value) {
      reorderItems(stocksResp.value.stocks, orderMap)
    }

    orderMap.forEach((_, k) => {
      saveUpdateStockDebounced(k)
    })
  }

  const deleteStock = async (id: number) => {
    const stocks = stocksResp.value?.stocks || []
    const toBeDeleted = findByID(stocks, id)

    if (!toBeDeleted || !stocksResp.value) return

    // Remove the stock from the array
    stocksResp.value.stocks = stocks.filter((s) => s.id !== id)

    saveDeleteStockDebounced(toBeDeleted)
  }

  const changeStock = async (stockCopy: Stock) => {
    if (!stocksResp.value || !stocksResp.value.stocks) return

    const stock = findByID(stocksResp.value.stocks, stockCopy.id)
    if (stock) {
      stock.symbol = stockCopy.symbol
    }

    saveUpdateStockDebounced(stockCopy.id)
  }

  const addTask = async () => {
    const tasks = tasksResp.value?.tasks || []
    if (tasks.some((t) => t.id === 0 || t.desc.trim() === '')) {
      // Do not insert new if there's an empty task.
      return
    }
    const maxOrd =
      tasks.length > 0
        ? Math.max.apply(
            null,
            tasks.map((t) => t.ord),
          )
        : 0
    let newTask = new Task({ id: 0, ord: maxOrd + 1, desc: '' })

    // Add the new task to the beginning of the array
    if (tasksResp.value) {
      tasksResp.value.tasks.unshift(newTask)
    }

    // Call API to create the task
    newTask = await API.genAddTask(newTask)

    // Update the ID of the newly created task
    if (tasksResp.value && tasksResp.value.tasks.length > 0) {
      const firstTask = tasksResp.value.tasks[0]
      if (firstTask?.id === 0) {
        firstTask.id = newTask.id
      }
    }
  }

  const moveUpTask = async (id: number) => {
    const tasks = tasksResp.value?.tasks || []
    const orderMap = swapOrderMap(tasks, id, true)

    if (tasksResp.value) {
      reorderItems(tasksResp.value.tasks, orderMap)
    }

    orderMap.forEach((_, k) => {
      saveUpdateTaskDebounced(k)
    })
  }

  const moveDownTask = async (id: number) => {
    const tasks = tasksResp.value?.tasks || []
    const orderMap = swapOrderMap(tasks, id, false)

    if (tasksResp.value) {
      reorderItems(tasksResp.value.tasks, orderMap)
    }

    orderMap.forEach((_, k) => {
      saveUpdateTaskDebounced(k)
    })
  }

  const deleteTask = async (id: number) => {
    const tasks = tasksResp.value?.tasks || []
    const toBeDeleted = findByID(tasks, id)

    if (!toBeDeleted || !tasksResp.value) return

    // Remove the task from the array
    tasksResp.value.tasks = tasks.filter((s) => s.id !== id)

    saveDeleteTaskDebounced(toBeDeleted)
  }

  const changeTask = async (taskCopy: Task) => {
    if (!tasksResp.value || !tasksResp.value.tasks) return

    const task = findByID(tasksResp.value.tasks, taskCopy.id)
    if (task) {
      task.desc = taskCopy.desc
      task.timestamp = taskCopy.timestamp
    }

    saveUpdateTaskDebounced(taskCopy.id)
  }

  // Return all state, getters and actions
  return {
    config,
    stocksResp,
    tasksResp,
    isEditable,
    shouldFadeEditButton,
    getStocks,
    getTasks,
    init,
    toggleEditable,
    fadeEditButton,
    fetchStocks,
    fetchTasks,
    addStock,
    moveUpStock,
    moveDownStock,
    deleteStock,
    changeStock,
    addTask,
    moveUpTask,
    moveDownTask,
    deleteTask,
    changeTask,
  }
})
