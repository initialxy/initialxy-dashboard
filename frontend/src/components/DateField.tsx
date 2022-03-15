import "./DateField.css";
import { DateTime } from "luxon";
import { defineComponent, PropType, ref } from "vue";
import { clx } from "../utils/Misc";
import Button from "./Button";
import { ButtonType } from "./Button";

export default defineComponent({
  name: "DateField",
  props: {
    value: { type: Number as PropType<number | null> },
    dateFormat: { type: String, required: true },
    editable: { type: Boolean },
    onInput: { type: Function as PropType<(ts: number | null) => void> },
  },
  setup(props) {
    const shouldShowPicker = ref(props.value != null);

    const onInput = (e: Event) => {
      if (e.target == null) {
        return;
      }
      const value = (e.target as HTMLInputElement).value || "";
      console.log(value);
      if (value === "") {
        shouldShowPicker.value = false;
      }

      if (props.onInput == null) {
        return;
      }

      if (value !== "") {
        props.onInput(DateTime.fromISO(value).toSeconds());
      } else {
        props.onInput(null);
      }
    };

    const onAddDate = () => {
      shouldShowPicker.value = true;
    }

    return () => {
      const dateTime = props.value &&
        DateTime.fromSeconds(props.value);
      return props.editable ? (
        shouldShowPicker.value ?
          <input
            class="DateField editable"
            type="date"
            onInput={onInput}
            value={dateTime && dateTime.toFormat('yyyy-MM-dd')}
          /> :
          <Button
            label="Add Date"
            onClick={onAddDate}
            buttonType={ButtonType.Add}
          />
      ) : (
        <span class={clx({ "DateField": true, "hidden": dateTime == null })}>
          {dateTime && dateTime.toFormat(props.dateFormat)}
        </span>
      );
    };
  }
});