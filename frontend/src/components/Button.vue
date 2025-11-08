<script setup lang="ts">
import { ButtonType, ButtonPosition } from '../types'

const props = withDefaults(
  defineProps<{
    label: string
    buttonType?: ButtonType
    buttonPosition?: ButtonPosition
    circular?: boolean
    disabled?: boolean
    onClick?: () => void
  }>(),
  {
    buttonType: ButtonType.Edit,
    buttonPosition: ButtonPosition.Standalone,
  },
)

const handleClick = (_: Event) => {
  if (props.onClick) {
    props.onClick()
  }
}
</script>

<template>
  <button
    :class="{
      'Button': true,
      [props.buttonType]: true,
      [props.buttonPosition]: true,
      'circular': props.circular
    }"
    @click="handleClick"
    :disabled="props.disabled"
  >
    {{ props.label }}
  </button>
</template>

<style scoped>
.Button {
  -webkit-tap-highlight-color: transparent;
  border-width: 0;
  border: none;
  color: white;
  height: 1.8rem;
  margin: 0;
  outline: none;
  padding: 0.4rem 0.8rem 0.4rem 0.8rem;
}

.Button.circular {
  width: 1.8rem;
  height: 1.8rem;
  padding: 0;
}

.Button:disabled {
  opacity: 0.5;
}

.Button.add {
  background-color: #b6caf2;
  color: #0044cc;
}

.Button.add:active {
  background-color: #8f9fbf;
}

.Button.edit {
  background-color: #e6e6e6;
  color: #808080;
}

.Button.edit:active {
  background-color: #b3b3b3;
}

.Button.delete {
  background-color: #f2b6b6;
  color: #cc0000;
}

.Button.delete:active {
  background-color: #bf8f8f;
}

.Button.standalone {
  border-radius: 0.9rem;
}

.Button.top {
  border-radius: 0.9rem 0.9rem 0 0;
}

.Button.right {
  border-radius: 0 0.9rem 0.9rem 0;
}

.Button.bottom {
  border-radius: 0 0 0.9rem 0.9rem;
}

.Button.left {
  border-radius: 0.9rem 0 0 0.9rem;
}
</style>
