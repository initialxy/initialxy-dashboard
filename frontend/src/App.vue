<script setup lang="ts">
import { ButtonType } from './types'
import { onMounted } from 'vue'
import { Stock } from './jsgen/Stock'
import { Task } from './jsgen/Task'
import { useStore } from './stores'
import AddButton from './components/AddButton.vue'
import Button from './components/Button.vue'
import Clock from './components/Clock.vue'
import StocksView from './components/StocksView.vue'
import TasksView from './components/TasksView.vue'

const UPDATE_EVERY_MS = 60000

const store = useStore()

// Placeholder for sleep function (using Date.now() instead of luxon DateTime)
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function genUpdateLoop() {
  while (true) {
    await sleep(UPDATE_EVERY_MS - (Date.now() % UPDATE_EVERY_MS))
    // Don't auto refresh when we are in edit mode to avoid overriding user
    // inputs and reduce thrash.
    if (!store.isEditable) {
      await Promise.all([store.fetchStocks(), store.fetchTasks()])
    }
  }
}

async function fadeEditButtonAfterWait() {
  await sleep(2000)
  store.fadeEditButton()
}

onMounted(async () => {
  await store.init()
  // Don't await the followings.
  genUpdateLoop()
  fadeEditButtonAfterWait()
})

const onToggleEdit = () => {
  store.toggleEditable()
}

const onAddStock = () => {
  store.addStock()
}

const onMoveUpStock = (id: number) => {
  store.moveUpStock(id)
}

const onMoveDownStock = (id: number) => {
  store.moveDownStock(id)
}

const onDeleteStock = (id: number) => {
  store.deleteStock(id)
}

const onChangeStock = (stockCopy: Stock) => {
  store.changeStock(stockCopy)
}

const onAddTask = () => {
  store.addTask()
}

const onMoveUpTask = (id: number) => {
  store.moveUpTask(id)
}

const onMoveDownTask = (id: number) => {
  store.moveDownTask(id)
}

const onDeleteTask = (id: number) => {
  store.deleteTask(id)
}

const onChangeTask = (taskCopy: Task) => {
  store.changeTask(taskCopy)
}
</script>

<template>
  <div :class="['App', { show_color: store.isEditable }]" v-if="store.config">
    <div class="app_body">
      <div class="header">
        <Clock :timeFormat="store.config.timeFormat" :dateFormat="store.config.dateFormat" />
        <Button
          class="edit_toggle"
          :class="{ fade: store.shouldFadeEditButton }"
          label="Edit dashboard"
          :buttonType="ButtonType.Edit"
          @click="onToggleEdit"
        />
        <AddButton
          v-if="store.isEditable"
          class="add_items_button"
          @add-stock="onAddStock"
          @add-task="onAddTask"
        />
      </div>
      <div class="contents">
        <div class="stocks_container">
          <StocksView
            :stocksResp="store.stocksResp"
            :numPoints="store.config.numDataPointsInDay"
            :editable="store.isEditable"
            @move-up="onMoveUpStock"
            @move-down="onMoveDownStock"
            @delete="onDeleteStock"
            @change="onChangeStock"
          />
        </div>
        <div class="tasks_container">
          <TasksView
            :tasksResp="store.tasksResp"
            :dateFormat="store.config.dateShortFormat"
            :editable="store.isEditable"
            @move-up="onMoveUpTask"
            @move-down="onMoveDownTask"
            @delete="onDeleteTask"
            @change="onChangeTask"
          />
        </div>
      </div>
    </div>
  </div>
  <div class="App" v-else></div>
</template>

<style scoped>
html,
body,
#app {
  background-color: black;
  height: 100%;
  margin: 0;
  overflow: hidden;
  width: 100%;
}

.App {
  background-color: black;
  color: black;
  font-family: Roboto, Arial, Helvetica, sans-serif;
  font-weight: 400;
  height: 100%;
  margin: 0;
  overflow: hidden;
  padding: 0;
  position: fixed;
  width: 100%;
}

.App > .app_body {
  background-image: url('/background.png');
  background-position: 100% 100%;
  background-repeat: no-repeat;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.App.show_color {
  background: linear-gradient(25deg, #19173c 0%, #1c1ca3 42%, #00a4c6 100%);
  font-weight: 300;
}

.App > .app_body > .header {
  position: relative;
}

.App > .app_body > .contents {
  padding: 0.15rem;
  box-sizing: border-box;
  flex: 1 1 0;
  position: relative;
}

.App.show_color > .app_body > .contents {
  padding: 0;
}

.App > .app_body > .contents .stocks_container,
.App > .app_body > .contents .tasks_container {
  float: none;
  height: 50%;
  position: relative;
  width: 100%;
}

.App.show_color > .app_body > .contents .stocks_container,
.App.show_color > .app_body > .contents .tasks_container {
  box-sizing: border-box;
  padding-bottom: 1rem;
}

.App > .app_body > .header > .edit_toggle {
  margin: 0.3rem;
  opacity: 1;
  position: absolute;
  right: 0;
  top: 0;
  transition: opacity 2s ease;
}

.App > .app_body > .header > .edit_toggle.fade {
  opacity: 0;
}

.App > .app_body > .header > .add_items_button {
  margin: 0 0.5rem 0.5rem 0;
  position: absolute;
  right: 0;
  bottom: 0;
}

@media (min-width: 800px) {
  .App > .app_body > .contents .stocks_container,
  .App > .app_body > .contents .tasks_container {
    float: left;
    height: 100%;
    width: 50%;
  }
}
</style>
