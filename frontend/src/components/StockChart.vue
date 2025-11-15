<script setup lang="ts">
import { computed } from 'vue'
import { Stock } from '../jsgen/Stock'

const props = defineProps<{
  stock: Stock
  numPoints: number
  showFullCandle?: boolean
  showColor?: boolean
}>()

// Helper functions
function getVPct(v: number, chartMin: number, chartMax: number): number {
  return chartMax !== chartMin
    ? Math.round(((chartMax - v) / (chartMax - chartMin)) * 10000) / 100
    : 50
}

function getHPct(i: number, tot: number): number {
  return Math.round((i / tot) * 10000) / 100
}

const widthPct = computed(() => Math.round((1 / props.numPoints) * 10000) / 100)
const chartRange = computed((): { min: number | null; max: number | null } => {
  if (props.stock.preDayClose == null || props.stock.dataPoints == null) {
    return { min: null, max: null }
  }

  const allValues = props.stock.dataPoints.map((d) => [d.max, d.min, d.open, d.close]).flat()
  allValues.push(props.stock.preDayClose)

  return {
    min: Math.min.apply(null, allValues),
    max: Math.max.apply(null, allValues),
  }
})
const isStockUp = computed(() => {
  return (props.stock.curMarketPrice || 0) >= (props.stock.preDayClose || 0)
})
</script>

<template>
  <div
    v-if="
      props.stock.dataPoints != null &&
      props.stock.preDayClose != null &&
      chartRange.min != null &&
      chartRange.max != null
    "
    :class="{
      StockChart: true,
      show_color: props.showColor,
      stock_up: isStockUp,
      stock_down: !isStockUp,
    }"
  >
    <div class="inner">
      <div
        class="line"
        :style="{ top: getVPct(props.stock.preDayClose, chartRange.min, chartRange.max) + '%' }"
      />
      <div
        v-if="props.showFullCandle"
        v-for="(d, i) in props.stock.dataPoints"
        :key="i"
        class="bar"
        :style="{
          top: getVPct(d.max, chartRange.min, chartRange.max) + '%',
          left: getHPct(i, props.numPoints) + '%',
          width: widthPct + '%',
          height: getVPct(chartRange.max - (d.max - d.min), chartRange.min, chartRange.max) + '%',
        }"
      />
      <div
        v-for="(d, i) in props.stock.dataPoints"
        :key="i"
        class="candle"
        :style="{
          top: getVPct(Math.max(d.open, d.close), chartRange.min, chartRange.max) + '%',
          left: getHPct(i, props.numPoints) + '%',
          width: widthPct + '%',
          height:
            getVPct(
              chartRange.max - (Math.max(d.open, d.close) - Math.min(d.open, d.close)),
              chartRange.min,
              chartRange.max,
            ) + '%',
        }"
      />
    </div>
  </div>
  <div v-else class="StockChart" />
</template>

<style scoped>
.StockChart .point {
  background-color: black;
  height: 10px;
  position: absolute;
  top: 0;
  width: 10px;
}

.StockChart > .inner {
  height: 100%;
  overflow: visible;
  position: relative;
  width: 100%;
}

.StockChart > .inner .line {
  background-color: #646464;
  height: 1px;
  position: absolute;
  width: 100%;
}

/* Doesn't look like we have enough resolution to do a candle stick.*/
.StockChart > .inner .bar {
  background-image: url('/bar.png');
  background-position: center;
  background-repeat: repeat-y;
  box-sizing: border-box;
  min-height: 3%;
  position: absolute;
}

.StockChart > .inner .candle {
  background-color: black;
  min-height: 3%;
  position: absolute;
}

.StockChart.show_color.stock_up > .inner .line,
.StockChart.show_color.stock_up > .inner .bar,
.StockChart.show_color.stock_up > .inner .candle {
  background-color: #37bf30;
}

.StockChart.show_color.stock_down > .inner .line,
.StockChart.show_color.stock_down > .inner .bar,
.StockChart.show_color.stock_down > .inner .candle {
  background-color: #bf3030;
}

.StockChart.show_color > .inner .candle {
  border: solid white;
  border-width: 0 0 0 1px;
  box-sizing: border-box;
}

.StockChart > .inner .bar {
  background-image: url('/bar.png');
  background-position: center;
  background-repeat: repeat-y;
  box-sizing: border-box;
  min-height: 3%;
  position: absolute;
}

.StockChart > .inner .candle {
  background-color: black;
  min-height: 3%;
  position: absolute;
}
</style>
