export type LogLevel = 'off' | 'simple' | 'detail'

const DEFAULT_LEVEL: LogLevel =
  process.env.NODE_ENV === 'production' ? 'simple' : 'detail'

function normalize(raw: string | undefined): LogLevel {
  const v = raw?.trim().toLowerCase()
  switch (v) {
    case 'off':
    case '关闭':
    case 'disable':
    case 'disabled':
      return 'off'
    case 'simple':
    case '简洁':
    case 'brief':
      return 'simple'
    case 'detail':
    case '详细':
    case 'verbose':
    case 'debug':
      return 'detail'
    default:
      return DEFAULT_LEVEL
  }
}

export const logLevel: LogLevel = normalize(process.env.LOG_LEVEL)

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
