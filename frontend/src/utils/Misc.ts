export function emptyFunc(): void { }

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve, _) => setTimeout(resolve, ms));
}

export function nullthrows<T>(v?: T): T {
  if (v == null) {
    throw new TypeError("Value cannot be null");
  }
  return v;
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

export function stx(styleDef: {[nane: string]: string}): string {
  const styles = [];
  for (const p in styleDef) {
    styles.push(`${p}: ${styleDef[p]};`);
  }
  return styles.join(" ");
}