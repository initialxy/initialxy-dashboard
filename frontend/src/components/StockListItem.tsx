import "./StockListItem.css";
import { defineComponent, PropType } from "vue";
import { Stock } from "../jsgen/Stock";
import ListItem from "./ListItem";
import StockChart from "./StockChart";
import TextField from "./TextField";

function round(num: number): number {
  return Math.round(num * 100) / 100;
}

function getPctChange(old: number, cur: number): number {
  const ratio = (cur / old - 1);
  return round(ratio * 100);
}

export default defineComponent({
  name: "StockListItem",
  props: {
    stock: { type: Stock, required: true },
    numPoints: { type: Number, required: true },
    editable: { type: Boolean },
    disableMoveUp: { type: Boolean },
    disableMoveDown: { type: Boolean },
    disabled: {type: Boolean},
    onMoveUp: { type: Function as PropType<(id: number) => void> },
    onMoveDown: { type: Function as PropType<(id: number) => void> },
    onDelete: { type: Function as PropType<(id: number) => void> },
    onChange: { type: Function as PropType<(stockCopy: Stock) => void> },
  },
  setup(props) {
    const onMoveUp = () => {
      props.onMoveUp && props.onMoveUp(props.stock.id);
    }
    const onMoveDown = () => {
      props.onMoveDown && props.onMoveDown(props.stock.id);
    }
    const onDelete = () => {
      props.onDelete && props.onDelete(props.stock.id);
    }
    const onInput = (symbol: string) => {
      if (props.onChange == null) {
        return;
      }

      // Do not mutate data models directly, that's store's job.
      const stockCopy = new Stock(props.stock);
      stockCopy.symbol = symbol;
      stockCopy.dataPoints = [];
      props.onChange(stockCopy);
    }

    return () => (
      <ListItem
        class="StockListItem"
        editable={props.editable}
        disableMoveUp={props.disableMoveUp}
        disableMoveDown={props.disableMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
        disabled={props.disabled}
      >
        <div class="row">
          <div class="summary">
            <div class="symbol">
              <TextField
                value={props.stock.symbol}
                editable={props.editable && !props.disabled}
                onInput={onInput}
              />
            </div>
            <div class="price">
              {
                props.stock.curMarketPrice != null ?
                  round(props.stock.curMarketPrice) :
                  "--"
              }
            </div>
            <div class="pct">
              {
                props.stock.curMarketPrice != null &&
                  props.stock.preDayClose != null ?
                  getPctChange(
                    props.stock.preDayClose,
                    props.stock.curMarketPrice,
                  ) :
                  "--"
              }
              %
            </div>
          </div>
          <StockChart
            class="chart" stock={props.stock}
            numPoints={props.numPoints}
            showColor={props.editable}
          />
        </div>
      </ListItem>
    );
  }
});
