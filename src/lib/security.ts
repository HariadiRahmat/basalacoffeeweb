/** Shared input validation and export hardening helpers. */

export function assertNonEmptyString(value: unknown, field: string): string {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${field} wajib diisi`);
  return text;
}

export function assertPositiveNumber(value: unknown, field: string): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error(`${field} harus angka positif`);
  }
  return num;
}

export function assertNonNegativeNumber(value: unknown, field: string): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    throw new Error(`${field} harus angka nol atau positif`);
  }
  return num;
}

export function clampLimit(value: number, max = 500): number {
  return Math.min(Math.max(1, Math.floor(value)), max);
}

/** Prevent Excel formula injection when exported files are opened in spreadsheet apps. */
export function sanitizeExcelCell(value: unknown): unknown {
  if (typeof value !== "string") return value;
  if (/^[=+\-@\t\r]/.test(value)) return `'${value}`;
  return value;
}

export function sanitizeExcelRow<T extends Record<string, unknown>>(row: T): T {
  const out = { ...row };
  for (const key of Object.keys(out)) {
    out[key as keyof T] = sanitizeExcelCell(out[key]) as T[keyof T];
  }
  return out;
}

export const GENERIC_ERROR_MESSAGE = "Terjadi kesalahan. Coba lagi nanti.";
