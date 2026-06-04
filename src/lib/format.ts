export function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function compactIdr(amount: number): string {
  if (amount >= 1_000_000) {
    const jt = amount / 1_000_000;
    return jt >= 10 ? `${Math.round(jt)}jt` : `${jt.toFixed(1)}jt`;
  }
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}rb`;
  return `${Math.round(amount)}`;
}

export function chartAxisLabel(value: number): string {
  if (value <= 0) return "0";
  return compactIdr(value);
}
