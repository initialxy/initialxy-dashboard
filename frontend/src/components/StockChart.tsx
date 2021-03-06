import "./StockChart.css";
import { defineComponent } from "vue";
import { Stock } from "../jsgen/Stock";
import { stx, clx } from "../utils/Misc";

function getRange(stock: Stock): Array<number | null> {
  if (stock.preDayClose == null || stock.dataPoints == null) {
    return [null, null];
  }

  const allValues = stock.dataPoints
    .map(d => [d.max, d.min, d.open, d.close])
    .flat();
  allValues.push(stock.preDayClose);

  return [Math.min.apply(null, allValues), Math.max.apply(null, allValues)];
}

function getVPct(v: number, chartMin: number, chartMax: number): number {
  return chartMax !== chartMin ?
    Math.round((chartMax - v) / (chartMax - chartMin) * 10000) / 100 :
    50;
}

function getHPct(i: number, tot: number): number {
  return Math.round(i / tot * 10000) / 100;
}

export default defineComponent({
  name: "StockChart",
  props: {
    stock: { type: Stock, required: true },
    numPoints: { type: Number, required: true },
    showFullCandle: { type: Boolean },
    showColor: { type: Boolean },
  },
  setup(props) {
    return () => {
      const widthPct = Math.round(1 / props.numPoints * 10000) / 100;
      const stock = props.stock;
      const [chartMin, chartMax] = getRange(stock);
      const isStockUp =
        (props.stock.curMarketPrice || 0) >= (props.stock.preDayClose || 0);
      return stock.dataPoints != null &&
        stock.preDayClose != null &&
        chartMax != null &&
        chartMin != null ? (
        <div
          class={clx({
            "StockChart": true,
            "show_color": props.showColor,
            "stock_up": isStockUp,
            "stock_down": !isStockUp,
          })}
        >
          <div class="inner">
            <div
              class="line"
              style={stx({
                "top": getVPct(stock.preDayClose, chartMin, chartMax) + "%",
              })}
            />
            {props.showFullCandle ?
              stock.dataPoints.map((d, i) => (
                <div
                  key={i}
                  class="bar"
                  style={stx({
                    "top": getVPct(d.max, chartMin, chartMax) + "%",
                    "left": getHPct(i, props.numPoints) + "%",
                    "width": widthPct + "%",
                    "height": getVPct(
                      chartMax - (d.max - d.min),
                      chartMin,
                      chartMax,
                    ) + "%",
                  })}
                />)
              ) : null}
            {stock.dataPoints.map((d, i) => {
              const high = Math.max(d.open, d.close);
              const low = Math.min(d.open, d.close);
              return (
                <div
                  key={i}
                  class="candle"
                  style={stx({
                    "top": getVPct(high, chartMin, chartMax) + "%",
                    "left": getHPct(i, props.numPoints) + "%",
                    "width": widthPct + "%",
                    "height": getVPct(
                      chartMax - (high - low),
                      chartMin,
                      chartMax,
                    ) + "%",
                  })}
                />);
            })}
          </div>
        </div>
      ) : <div class="StockChart" />;
    };
  }
});