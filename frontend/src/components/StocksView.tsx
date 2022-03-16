import "./StocksView.css";
import { defineComponent, PropType } from "vue";
import { Stocks } from "../jsgen/Stocks";
import { stx } from "../utils/Misc";
import StockListItem from "./StockListItem";

const NUM_ITEMS_IN_VIEW = 4;

export default defineComponent({
  name: "StocksView",
  props: {
    stocksResp: { type: Object as PropType<Stocks | null> },
    numPoints: { type: Number, required: true },
    editable: { type: Boolean },
    onMoveUp: { type: Function as PropType<(id: number) => void> },
    onMoveDown: { type: Function as PropType<(id: number) => void> },
    onDelete: { type: Function as PropType<(id: number) => void> },
  },
  setup(props) {
    const heightPct = Math.round(10000 / NUM_ITEMS_IN_VIEW) / 100;
    return () => (
      <div class="StocksView">
        {(props.stocksResp?.stocks || []).map((stock, i) => (
          <StockListItem
            key={stock.id}
            style={stx({ "height": heightPct + "%" })}
            stock={stock}
            numPoints={props.numPoints}
            editable={props.editable}
            disableMoveUp={i === 0}
            disableMoveDown={i + 1 === props.stocksResp?.stocks?.length}
            onMoveUp={props.onMoveUp}
            onMoveDown={props.onMoveDown}
            onDelete={props.onDelete}
            disabled={stock.id === 0}
          />
        ))}
      </div>);
  }
});