import "./StocksView.css";
import { defineComponent } from "vue";
import { Stocks } from "../jsgen/Stocks";
import ListItem from "./ListItem";

const NUM_ITEMS_IN_VIEW = 4;

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
            {stock.symbol} {stock.ord}
          </ListItem>
        ))}
      </div>);
  }
});