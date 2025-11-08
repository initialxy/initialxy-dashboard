<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DateTime } from 'luxon'
import { sleep } from '../utils/Misc'

const UPDATE_EVERY_MS = 60000

const props = defineProps<{
  timeFormat: string
  dateFormat: string
}>()

const timestamp = ref(DateTime.now().toMillis())

async function genUpdateLoop(): Promise<void> {
  while (true) {
    await sleep(UPDATE_EVERY_MS - (DateTime.now().toMillis() % UPDATE_EVERY_MS))
    timestamp.value = DateTime.now().toMillis()
  }
}

onMounted(async () => {
  genUpdateLoop()
})
</script>

<template>
  <div class="Clock">
    <div class="display">
      <span class="time">
        {{ DateTime.fromMillis(timestamp).toFormat(props.timeFormat) }}
      </span>
      <span class="date">
        {{ DateTime.fromMillis(timestamp).toFormat(props.dateFormat) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.Clock {
  overflow: hidden;
  width: 100%;
  background-image: url('/header_texture.png');
  background-repeat: no-repeat;
  background-position: 100% 0;
}

.Clock .display {
  color: white;
  vertical-align: baseline;
  padding: 1rem;
}

.Clock .display .time {
  font-size: 3rem;
  font-weight: 500;
}

.Clock .display .date {
  margin-left: 1rem;
  font-size: 1.5rem;
}
</style>
