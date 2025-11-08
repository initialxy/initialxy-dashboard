<script setup lang="ts">
import { Stock } from '../jsgen/Stock'
import ListItem from './ListItem.vue'
import StockChart from './StockChart.vue'
import TextField from './TextField.vue'

const props = defineProps<{
  stock: Stock
  numPoints: number
  editable?: boolean
  disableMoveUp?: boolean
  disableMoveDown?: boolean
  disabled?: boolean
  onMoveUp?: (id: number) => void
  onMoveDown?: (id: number) => void
  onDelete?: (id: number) => void
  onChange?: (stockCopy: Stock) => void
}>()

const emit = defineEmits<{
  (e: 'moveUp', id: number): void
  (e: 'moveDown', id: number): void
  (e: 'delete', id: number): void
}>()

function round(num: number): number {
  return Math.round(num * 100) / 100
}

function getPctChange(old: number, cur: number): number {
  const ratio = cur / old - 1
  return round(ratio * 100)
}

const onMoveUp = () => {
  if (props.onMoveUp) {
    props.onMoveUp(props.stock.id)
  }
}

const onMoveDown = () => {
  if (props.onMoveDown) {
    props.onMoveDown(props.stock.id)
  }
}

const onDelete = () => {
  if (props.onDelete) {
    props.onDelete(props.stock.id)
  }
}

const onInput = (symbol: string) => {
  if (!props.onChange) {
    return
  }

  // Do not mutate data models directly, that's store's job.
  const stockCopy = new Stock(props.stock)
  stockCopy.symbol = symbol
  stockCopy.dataPoints = []
  props.onChange(stockCopy)
}
</script>

<template>
  <ListItem
    class="StockListItem"
    :editable="props.editable"
    :disable-move-up="props.disableMoveUp"
    :disable-move-down="props.disableMoveDown"
    @move-up="onMoveUp"
    @move-down="onMoveDown"
    @delete="onDelete"
    :disabled="props.disabled"
  >
    <div class="row">
      <div class="summary">
        <div class="symbol">
          <TextField
            :value="props.stock.symbol"
            :editable="props.editable && !props.disabled"
            @input="onInput"
          />
        </div>
        <div class="price">
          {{ props.stock.curMarketPrice != null ? round(props.stock.curMarketPrice) : '--' }}
        </div>
        <div class="pct">
          {{
            props.stock.curMarketPrice != null && props.stock.preDayClose != null
              ? getPctChange(props.stock.preDayClose, props.stock.curMarketPrice)
              : '--'
          }}%
        </div>
      </div>
      <StockChart
        class="chart"
        :stock="props.stock"
        :num-points="props.numPoints"
        :show-color="props.editable"
      />
    </div>
  </ListItem>
</template>

<style scoped>
.StockListItem .row {
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 100%;
}

.StockListItem .row .summary .symbol {
  font-weight: 500;
  max-width: 4rem;
}

.StockListItem .row .summary,
.StockListItem .row .chart {
  overflow: hidden;
  white-space: nowrap;
}

.StockListItem .row .chart {
  flex: 1 1 0;
  height: 100%;
  padding: 1rem 0 1rem 1rem;
  box-sizing: border-box;
  position: relative;
}

.StockListItem.editable .row > .chart {
  padding: 0.5rem 0 0.5rem 0.5rem;
  border-radius: 0.3rem;
}

.StockListItem.editable .row > .summary > div {
  margin: 0.2rem 0 0.2rem 0;
}
</style>
