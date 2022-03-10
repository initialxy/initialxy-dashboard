import "./StocksView.css";
import { defineComponent } from "vue";
import { Stocks } from "../jsgen/Stocks";
import ListItem from "./ListItem";

export default defineComponent({
  name: "StocksView",
  props: {
    stocksResp: { type: Object as () => Stocks | null },
  },
  setup(props) {
    return () => (
      <div class="StocksView">
        {(props.stocksResp?.stocks || []).map(stock => (
          <ListItem>{stock.symbol} {stock.ord}</ListItem>
        ))}
      </div>);
  }
});