export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso

  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function waitMinutes(createdAt: string, now: number): number {
  const ordered = new Date(createdAt.replace(" ", "T"))
  return Math.max(0, Math.floor((now - ordered.getTime()) / 60000))
}
