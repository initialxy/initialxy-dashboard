<script setup lang="ts">
import { ref } from 'vue'
import { DateTime } from 'luxon'
import Button from './Button.vue'
import { ButtonType } from '../types'

const props = defineProps<{
  value: number | null
  dateFormat: string
  editable: boolean
  onInput?: (ts: number | null) => void
}>()

const shouldShowPicker = ref(props.value != null)

const onInput = (e: Event) => {
  if (e.target == null) {
    return
  }
  const value = (e.target as HTMLInputElement).value || ''
  if (value === '') {
    shouldShowPicker.value = false
  }

  if (props.onInput == null) {
    return
  }

  if (value !== '') {
    props.onInput(DateTime.fromISO(value).toSeconds())
  } else {
    props.onInput(null)
  }
}

const onAddDate = () => {
  shouldShowPicker.value = true
}
</script>

<template>
  <div class="DateField">
    <div v-if="props.editable">
      <input
        v-if="shouldShowPicker"
        class="DateField editable"
        type="date"
        @input="onInput"
        :value="props.value ? DateTime.fromSeconds(props.value).toFormat('yyyy-MM-dd') : ''"
      />
      <Button v-else label="Add Date" @click="onAddDate" :button-type="ButtonType.Add" circular />
    </div>
    <span v-else :class="{ DateField: true, hidden: props.value == null }">
      {{ props.value ? DateTime.fromSeconds(props.value).toFormat(props.dateFormat) : '' }}
    </span>
  </div>
</template>

<style scoped>
input.DateField {
  font-family: Roboto, Arial, Helvetica, sans-serif;
  width: 8rem;
}

.DateField.hidden {
  display: none;
}
</style>
