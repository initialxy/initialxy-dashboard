<script setup lang="ts">
import { Stock } from '../jsgen/Stock'
import { Stocks } from '../jsgen/Stocks'
import { stx } from '../utils/Misc'
import StockListItem from './StockListItem.vue'

const NUM_ITEMS_IN_VIEW = 4

const props = defineProps<{
  stocksResp: Stocks | null
  numPoints: number
  editable?: boolean
  onMoveUp?: (id: number) => void
  onMoveDown?: (id: number) => void
  onDelete?: (id: number) => void
  onChange?: (stockCopy: Stock) => void
}>()

const heightPct = Math.round(10000 / NUM_ITEMS_IN_VIEW) / 100
</script>

<template>
  <div class="StocksView">
    <StockListItem
      v-for="(stock, i) in props.stocksResp?.stocks || []"
      :key="stock.id"
      :style="stx({ height: heightPct + '%' })"
      :stock="stock"
      :numPoints="props.numPoints"
      :editable="props.editable"
      :disableMoveUp="i === 0"
      :disableMoveDown="i + 1 === props.stocksResp?.stocks?.length"
      @move-up="props.onMoveUp?.(stock.id)"
      @move-down="props.onMoveDown?.(stock.id)"
      @delete="props.onDelete?.(stock.id)"
      @change="props.onChange?.(stock)"
      :disabled="stock.id === 0"
    />
  </div>
</template>

<style scoped>
.StocksView {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
}
</style>
