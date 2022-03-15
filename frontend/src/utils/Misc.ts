export function emptyFunc(): void { }

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve, _) => window.setTimeout(resolve, ms));
}

export function nullthrows<T>(v?: T | null): T {
  if (v == null) {
    throw new TypeError("Value cannot be null");
  }
  return v;
}

export function onlyx<T>(vs: Array<T>): T {
  if (vs.length != 1) {
    throw new RangeError("Only one value is expcted");
  }
  return vs[0];
}

export function clx(clsDef: { [cls: string]: boolean }): string {
  const classes = [];
  for (const c in clsDef) {
    if (clsDef[c]) {
      classes.push(c);
    }
  }
  return classes.join(" ");
}

export function stx(styleDef: { [nane: string]: string }): string {
  const styles = [];
  for (const p in styleDef) {
    styles.push(`${p}: ${styleDef[p]};`);
  }
  return styles.join(" ");
}

export function debounceBatch<T, U>(
  fn: (vs: Array<T>) => U,
  ms: number,
): (v: T) => void {
  let scheduleID = 0;
  let batch: Array<T> = [];
  return (props: T) => {
    if (scheduleID !== 0) {
      window.clearTimeout(scheduleID);
    }
    batch.push(props);
    scheduleID = window.setTimeout(() => {
      scheduleID = 0;
      const batchCp = batch;
      batch = [];
      fn(batchCp);
    }, ms);
  };
}

export function debounce(fn: () => void, ms: number): () => void {
  const dfn = debounceBatch((_v) => fn(), ms);
  return () => dfn(null);
}

export function wrapCallback<T>(
  fn: ((v: T) => void) | undefined,
  v: T,
): (() => void) | undefined {
  if (fn == undefined) {
    return undefined;
  }
  return () => {
    fn && fn(v);
  };
}