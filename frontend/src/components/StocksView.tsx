import "./StocksView.css";
import { defineComponent, PropType } from "vue";
import { Stocks } from "../jsgen/Stocks";
import { stx } from "../utils/Misc";
import ListItem from "./ListItem";
import StockChart from "./StockChart";
import TextField from "./TextField";

const NUM_ITEMS_IN_VIEW = 4;

function getPctChange(old: number, cur: number): number {
  const ratio = (cur / old - 1);
  return Math.round(ratio * 10000) / 100;
}

export default defineComponent({
  name: "StocksView",
  props: {
    stocksResp: { type: Object as PropType<Stocks | null> },
    numPoints: { type: Number, required: true },
    editable: { type: Boolean },
  },
  setup(props) {
    const heightPct = Math.round(10000 / NUM_ITEMS_IN_VIEW) / 100;
    return () => (
      <div class="StocksView">
        {(props.stocksResp?.stocks || []).map((stock, i) => (
          <ListItem
            key={stock.symbol}
            style={stx({ "height": heightPct + "%" })}
            editable={props.editable}
            disableMoveUp={i === 0}
            disableMoveDown={i + 1 === props.stocksResp?.stocks?.length}
          >
            <div class="row">
              <div class="summary">
                <div class="symbol">
                  <TextField value={stock.symbol} editable={props.editable} />
                </div>
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
              <StockChart
                class="chart" stock={stock}
                numPoints={props.numPoints}
              />
            </div>
          </ListItem>
        ))}
      </div>);
  }
});