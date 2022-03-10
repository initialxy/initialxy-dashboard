import "./StocksView.css";
import { defineComponent } from "vue";
import { Stocks } from "../jsgen/Stocks";
import ListItem from "./ListItem";

const NUM_ITEMS_IN_VIEW = 4;

function getPctChange(old: number, cur: number): number {
  const ratio = (cur / old - 1);
  return Math.round(ratio * 10000) / 100;
}

export default defineComponent({
  name: "StocksView",
  props: {
    stocksResp: { type: Object as () => Stocks | null },
  },
  setup(props) {
    const heightPct = Math.round(10000 / NUM_ITEMS_IN_VIEW) / 100;
    return () => (
      <div class="StocksView">
        {(props.stocksResp?.stocks || []).map(stock => (
          <ListItem style={`height: ${heightPct}%;`}>
            <div class="row">
              <div class="summary">
                <div class="symbol">{stock.symbol}</div>
                <div class="price">
                  {stock.curMarketPrice != null ? stock.curMarketPrice : "--"}
                </div>
                <div class="pct">
                  {stock.curMarketPrice != null && stock.preDayClose != null ?
                    getPctChange(stock.preDayClose, stock.curMarketPrice) :
                    "--"
                  }
                  %
                </div>
              </div>
              <div class="chart">
              </div>
            </div>
          </ListItem>
        ))}
      </div>);
  }
});