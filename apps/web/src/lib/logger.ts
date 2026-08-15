export type LogLevel = "off" | "simple" | "detail"

const DEFAULT_LEVEL: LogLevel = import.meta.env.PROD ? "simple" : "detail"

function normalize(raw: string | undefined): LogLevel {
  const v = raw?.trim().toLowerCase()
  if (v === "off" || v === "simple" || v === "detail") return v
  return DEFAULT_LEVEL
}

export const logLevel: LogLevel = normalize(
  import.meta.env.VITE_LOG_LEVEL as string | undefined
)

function timestamp(): string {
  return new Date().toISOString()
}

function toConcise(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === "string") return a
      if (a instanceof Error) return a.message
      return ""
    })
    .filter((s) => s !== "")
    .join(" ")
}

function emit(level: string, stream: "out" | "err", args: unknown[]): void {
  if (logLevel === "off") return
  const head = `${timestamp()} [${level}]`
  if (logLevel === "simple") {
    console.log(`${head} ${toConcise(args)}`)
    return
  }
  const write =
    stream === "err" ? console.error : level === "WARN" ? console.warn : console.log
  write(head, ...args)
}

export const logger = {
  logLevel,
  debug: (...args: unknown[]) => emit("DEBUG", "out", args),
  info: (...args: unknown[]) => emit("INFO", "out", args),
  warn: (...args: unknown[]) => emit("WARN", "out", args),
  error: (...args: unknown[]) => emit("ERROR", "err", args),
}
