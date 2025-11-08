<script setup lang="ts">
import { Task } from '../jsgen/Task'
import { Tasks } from '../jsgen/Tasks'
import { stx } from '../utils/Misc'
import TaskListItem from './TaskListItem.vue'

const NUM_ITEMS_IN_VIEW = 8

const props = defineProps<{
  tasksResp: Tasks | null
  dateFormat: string
  editable?: boolean
  onMoveUp?: (id: number) => void
  onMoveDown?: (id: number) => void
  onDelete?: (id: number) => void
  onChange?: (taskCopy: Task) => void
}>()

const heightPct = Math.round(10000 / NUM_ITEMS_IN_VIEW) / 100
</script>

<template>
  <div class="TasksView">
    <TaskListItem
      v-for="(task, i) in props.tasksResp?.tasks || []"
      :key="task.id"
      :style="
        stx({
          height: (props.editable ? heightPct * 2 : heightPct) + '%',
        })
      "
      :task="task"
      :dateFormat="props.dateFormat"
      :editable="props.editable"
      :disableMoveUp="i === 0"
      :disableMoveDown="i + 1 === props.tasksResp?.tasks?.length"
      @move-up="props.onMoveUp?.(task.id)"
      @move-down="props.onMoveDown?.(task.id)"
      @delete="props.onDelete?.(task.id)"
      @change="props.onChange?.(task)"
      :disabled="task.id === 0"
    />
  </div>
</template>

<style scoped>
.TasksView {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
}
</style>
