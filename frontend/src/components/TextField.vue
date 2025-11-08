<script setup lang="ts">
const props = defineProps<{
  value?: string
  editable?: boolean
  onInput?: (v: string) => void
}>()

const onInput = (e: Event) => {
  if (e.target == null || props.onInput == null) {
    return
  }
  props.onInput((e.target as HTMLInputElement).value || "")
}
</script>

<template>
  <div class="TextField">
    <input
      v-if="props.editable"
      class="TextField editable"
      type="text"
      @input="onInput"
      :value="props.value"
    />
    <span v-else class="Text">
      {{ props.value }}
    </span>
  </div>
</template>

<style scoped>
.TextField {
  overflow: hidden;
}

input.TextField.editable {
  -webkit-user-modify: read-write;
  border-bottom: 1px solid #969696;
  border-radius: 0;
  border-width: 0 0 1px 0;
  box-sizing: border-box;
  display: inline-block;
  font-size: 0.9em;
  min-width: 3em;
  outline: none;
  width: 100%;
  padding: 0;
}

.TextField.editable:focus {
  border-bottom: 1px solid #4d4d4d;
}
</style>