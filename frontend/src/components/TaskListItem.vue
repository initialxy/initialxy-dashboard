<script setup lang="ts">
import { Task } from '../jsgen/Task'
import ListItem from './ListItem.vue'
import TextField from './TextField.vue'
import DateField from './DateField.vue'

const props = defineProps<{
  task: Task
  dateFormat: string
  editable?: boolean
  disableMoveUp?: boolean
  disableMoveDown?: boolean
  disabled?: boolean
  onMoveUp?: (id: number) => void
  onMoveDown?: (id: number) => void
  onDelete?: (id: number) => void
  onChange?: (taskCopy: Task) => void
}>()

const emit = defineEmits<{
  (e: 'moveUp', id: number): void
  (e: 'moveDown', id: number): void
  (e: 'delete', id: number): void
}>()

const onMoveUp = () => {
  if (props.onMoveUp) {
    props.onMoveUp(props.task.id)
  }
}

const onMoveDown = () => {
  if (props.onMoveDown) {
    props.onMoveDown(props.task.id)
  }
}

const onDelete = () => {
  if (props.onDelete) {
    props.onDelete(props.task.id)
  }
}

const onDescInput = (desc: string) => {
  if (!props.onChange) {
    return
  }

  // Do not mutate data models directly, that's store's job.
  const taskCopy = new Task(props.task)
  taskCopy.desc = desc
  props.onChange(taskCopy)
}

const onDateInput = (timestamp: number | null) => {
  if (!props.onChange) {
    return
  }

  const taskCopy = new Task(props.task)
  taskCopy.timestamp = timestamp !== null ? timestamp : undefined
  props.onChange(taskCopy)
}
</script>

<template>
  <ListItem
    class="TaskListItem"
    :editable="props.editable"
    :disable-move-up="props.disableMoveUp"
    :disable-move-down="props.disableMoveDown"
    @move-up="onMoveUp"
    @move-down="onMoveDown"
    @delete="onDelete"
    :disabled="props.disabled"
    auto-middle
  >
    <div class="row">
      <div class="desc">
        <TextField
          :value="props.task.desc"
          :editable="props.editable && !props.disabled"
          @input="onDescInput"
        />
      </div>
      <div class="date">
        <DateField
          class="date_field"
          :value="props.task.timestamp ?? null"
          :date-format="props.dateFormat"
          :editable="props.editable && !props.disabled"
          @input="onDateInput"
        />
      </div>
    </div>
  </ListItem>
</template>

<style scoped>
.TaskListItem .row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.TaskListItem .row .desc {
  flex: 1 1 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.TaskListItem .row .date {
  color: #646464;
  flex: 0 0 1;
}

.TaskListItem .row .date > .date_field {
  margin-left: 1em;
}

.TaskListItem.editable .row .date > .date_field {
  margin-left: 0.5em;
}
</style>
