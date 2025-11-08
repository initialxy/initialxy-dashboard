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
function getRange(stock: Stock): [number | null, number | null] {
  if (stock.preDayClose == null || stock.dataPoints == null) {
    return [null, null]
  }

  const allValues = stock.dataPoints.map((d) => [d.max, d.min, d.open, d.close]).flat()
  allValues.push(stock.preDayClose)

  return [Math.min.apply(null, allValues), Math.max.apply(null, allValues)]
}

function getVPct(v: number, chartMin: number, chartMax: number): number {
  return chartMax !== chartMin
    ? Math.round(((chartMax - v) / (chartMax - chartMin)) * 10000) / 100
    : 50
}

function getHPct(i: number, tot: number): number {
  return Math.round((i / tot) * 10000) / 100
}

const widthPct = computed(() => Math.round((1 / props.numPoints) * 10000) / 100)
const [chartMin, chartMax] = getRange(props.stock)
const isStockUp = computed(() => {
  return (props.stock.curMarketPrice || 0) >= (props.stock.preDayClose || 0)
})
</script>

<template>
  <div
    v-if="
      props.stock.dataPoints != null &&
      props.stock.preDayClose != null &&
      chartMax != null &&
      chartMin != null
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
        :style="{ top: getVPct(props.stock.preDayClose, chartMin, chartMax) + '%' }"
      />
      <div
        v-if="props.showFullCandle"
        v-for="(d, i) in props.stock.dataPoints"
        :key="i"
        class="bar"
        :style="{
          top: getVPct(d.max, chartMin, chartMax) + '%',
          left: getHPct(i, props.numPoints) + '%',
          width: widthPct + '%',
          height: getVPct(chartMax - (d.max - d.min), chartMin, chartMax) + '%',
        }"
      />
      <div
        v-for="(d, i) in props.stock.dataPoints"
        :key="i"
        class="candle"
        :style="{
          top: getVPct(Math.max(d.open, d.close), chartMin, chartMax) + '%',
          left: getHPct(i, props.numPoints) + '%',
          width: widthPct + '%',
          height:
            getVPct(
              chartMax - (Math.max(d.open, d.close) - Math.min(d.open, d.close)),
              chartMin,
              chartMax,
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
</style>
