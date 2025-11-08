<script setup lang="ts">
import Button from './Button.vue'
import { ButtonType, ButtonPosition } from '../types'

const props = defineProps<{
  autoMiddle?: boolean
  editable?: boolean
  disabled?: boolean
  disableMoveUp?: boolean
  disableMoveDown?: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
  onDelete?: () => void
}>()
</script>

<template>
  <div :class="{
    'ListItem': true,
    'auto_middle': props.autoMiddle,
    'editable': props.editable,
  }">
    <div class="item_container">
      <div v-if="props.editable" class="move_position">
        <Button
          class="move_up"
          label="↑"
          :button-position="ButtonPosition.Top"
          circular
          :disabled="props.disableMoveUp || props.disabled"
          @click="props.onMoveUp"
        />
        <Button
          class="move_down"
          label="↓"
          :button-position="ButtonPosition.Bottom"
          circular
          :disabled="props.disableMoveDown || props.disabled"
          @click="props.onMoveDown"
        />
      </div>
      <div class="item_body">
        <slot></slot>
      </div>
      <div v-if="props.editable" class="delete_container">
        <Button
          class="delete_item"
          label="➖"
          :button-type="ButtonType.Delete"
          circular
          @click="props.onDelete"
          :disabled="props.disabled"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ListItem {
  box-sizing: border-box;
  min-height: 3rem;
  position: relative;
  padding: 0.15rem;
  font-size: 0.9em;
}

.ListItem.editable {
  padding: 0;
  border-bottom: 1px solid #b3b3b3;
}

.ListItem.editable > .item_container {
  padding: 0;
  border-radius: 0;
}

.ListItem > .item_container {
  align-items: center;
  display: flex;
  flex-direction: row;
  padding: 0 1rem 0 1rem;
  background-color: white;
  height: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
}

.ListItem > .item_container > .item_body {
  flex: 1 1 0;
  height: 100%;
  overflow: hidden;
  width: 100%;
}

.ListItem.auto_middle > .item_container >  .item_body {
  height: auto;
  width: auto;
}

.ListItem > .item_container > .move_position .move_up,
.ListItem > .item_container > .move_position .move_down,
.ListItem > .item_container > .delete_container .delete_item {
  display: block;
}

.ListItem > .item_container > .move_position,
.ListItem > .item_container > .delete_container {
  margin: 0 0.5rem 0 0.5rem;
}

@media (min-width: 800px) {
  .ListItem {
    font-size: 1.3em;
  }
}
</style>