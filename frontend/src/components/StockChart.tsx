import "./StockChart.css";
import { defineComponent } from "vue";
import { Stock } from "../jsgen/Stock";
import { stx } from "../utils/Misc";

const TOT_POINTS = 79;

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

function getHPct(i: number): number {
  return Math.round(i / TOT_POINTS * 10000) / 100;
}

export default defineComponent({
  name: "StockChart",
  props: { stock: { type: Stock, required: true } },
  setup(props) {
    const widthPct = Math.round(1 / TOT_POINTS * 10000) / 100;
    return () => {
      const stock = props.stock;
      const [chartMin, chartMax] = getRange(stock);
      return stock.dataPoints != null &&
        stock.preDayClose != null &&
        chartMax != null &&
        chartMin != null ? (
        <div class="StockChart">
          <div class="inner">
            <div
              class="line"
              style={stx({
                "top": `${getVPct(stock.preDayClose, chartMin, chartMax)}%`,
              })}
            />
            {stock.dataPoints.map((d, i) => (
              <div
                class="bar"
                style={stx({
                  "top": `${getVPct(d.max, chartMin, chartMax)}%`,
                  "left": `${getHPct(i)}%`,
                  "width": `${widthPct}%`,
                  "height": `${getVPct(
                    chartMax - (d.max - d.min),
                    chartMin,
                    chartMax,
                  )}%`,
                })}
              />
            ))}
          </div>
        </div>
      ) : <div class="StockChart" />;
    };
  }
});