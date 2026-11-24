/** Converte uma string (aceitando vírgula decimal) em número, ou `null` se inválida. */
export function parseNumber(value: string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = parseFloat(String(value).replace(',', '.'));
  return isNaN(n) ? null : n;
}

/** Data atual no formato ISO (yyyy-MM-dd), usado para inputs type="date". */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Formata segundos como m:ss, usado no cronômetro de descanso. */
export function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
