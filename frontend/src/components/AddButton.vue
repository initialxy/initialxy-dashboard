<script setup lang="ts">
import { ref } from 'vue'
import { ButtonType, ButtonPosition } from '../types'
import Button from './Button.vue'

const props = defineProps<{
  onAddStock?: () => void
  onAddTask?: () => void
}>()

const shouldShowDropDown = ref(false)

const onClick = () => {
  shouldShowDropDown.value = !shouldShowDropDown.value
}

const onAddStock = () => {
  shouldShowDropDown.value = false
  props.onAddStock?.()
}

const onAddTask = () => {
  shouldShowDropDown.value = false
  props.onAddTask?.()
}
</script>

<template>
  <div class="AddButton">
    <Button class="add_button" :button-type="ButtonType.Add" label="➕" @click="onClick" circular />
    <div v-if="shouldShowDropDown" class="drop_down">
      <Button
        class="add_stock"
        :button-type="ButtonType.Add"
        :button-position="ButtonPosition.Top"
        label="Stock"
        @click="onAddStock"
      />
      <Button
        class="add_task"
        :button-type="ButtonType.Add"
        :button-position="ButtonPosition.Bottom"
        label="Task"
        @click="onAddTask"
      />
    </div>
  </div>
</template>

<style scoped>
.AddButton > .add_button {
  display: block;
}

.AddButton > .drop_down {
  background-color: #b6caf2;
  border-radius: 0.9rem;
  clear: both;
  margin-top: 2rem;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 99;
}

.AddButton .drop_down .add_stock,
.AddButton .drop_down .add_task {
  display: block;
  width: 6rem;
  box-shadow: none;
}
</style>
