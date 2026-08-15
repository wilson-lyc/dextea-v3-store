import { config } from '@/config.js'

export type LogLevel = 'off' | 'simple' | 'detail'

const DEFAULT_LEVEL: LogLevel = 'detail'

function normalize(raw: string | undefined): LogLevel {
  const v = raw?.trim().toLowerCase()
  if (v === 'off' || v === 'simple' || v === 'detail') return v
  return DEFAULT_LEVEL
}

export const logLevel: LogLevel = normalize(config.logLevel)

function timestamp(): string {
  return new Date().toISOString()
}

function toConcise(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === 'string') return a
      if (a instanceof Error) return a.message
      return ''
    })
    .filter((s) => s !== '')
    .join(' ')
}

function emit(level: string, stream: 'out' | 'err', args: unknown[]): void {
  if (logLevel === 'off') return
  const head = `${timestamp()} [${level}]`
  if (logLevel === 'simple') {
    console.log(`${head} ${toConcise(args)}`)
    return
  }
  const write = stream === 'err' ? console.error : console.log
  write(`${head}`, ...args)
}

export const logger = {
  logLevel,
  debug: (...args: unknown[]) => emit('DEBUG', 'out', args),
  info: (...args: unknown[]) => emit('INFO', 'out', args),
  warn: (...args: unknown[]) => emit('WARN', 'err', args),
  error: (...args: unknown[]) => emit('ERROR', 'err', args),
}
