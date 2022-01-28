import * as Sentry from '@sentry/browser'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LoggerOptions {
  consoleEnabled?: boolean
  consoleLevel?: LogLevel
  sentryEnabled?: boolean
  sentryLevel?: LogLevel
  sentryDsn: string
  sentryEnv: string
  packageName: string
  packageVersion: string
}

export class Logger {
  consoleEnabled: boolean
  consoleLevel: LogLevel
  sentryEnabled: boolean
  sentryLevel: LogLevel

  constructor(options: LoggerOptions) {
    this.consoleEnabled = options.consoleEnabled ?? true
    this.consoleLevel = options.consoleLevel ?? LogLevel.DEBUG
    this.sentryEnabled = options.sentryEnabled ?? true
    this.sentryLevel = options.sentryLevel ?? LogLevel.WARN

    Sentry.init({
      dsn: options.sentryDsn,
      release: `${options.packageName}@${options.packageVersion}`,
      environment: options.sentryEnv,
      tracesSampleRate: 1.0
    })
  }

  public debug(...args: any[]): void {
    this.logToConsole(LogLevel.DEBUG, args)
    this.logToSentry(LogLevel.DEBUG, args)
  }

  public info(...args: any[]): void {
    this.logToConsole(LogLevel.INFO, args)
    this.logToSentry(LogLevel.INFO, args)
  }

  public warn(...args: any[]): void {
    this.logToConsole(LogLevel.WARN, args)
    this.logToSentry(LogLevel.WARN, args)
  }

  public error(...args: any[]): void {
    this.logToConsole(LogLevel.ERROR, args)
    this.logToSentry(LogLevel.ERROR, args)
  }

  private getMessage(args: any[]) {
    return args.reduce((m, a, i) => {
      const v = typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
      return i === 0 ? v : [m, v].join(', ')
    })
  }

  private logToConsole(level: LogLevel, args: any[]): void {
    if (!this.consoleEnabled || level < this.consoleLevel)
      return

    switch (level) {
      case LogLevel.DEBUG:
        return console.debug.apply(console, args)
      case LogLevel.INFO:
        return console.info.apply(console, args)
      case LogLevel.WARN:
        return console.warn.apply(console, args)
      case LogLevel.ERROR:
        return console.error.apply(console, args)
    }
  }

  private logToSentry(level: LogLevel, args: any[]): void {
    if (!this.sentryEnabled || level < this.sentryLevel)
      return

    const message = this.getMessage(args)

    switch (level) {
      case LogLevel.DEBUG:
        Sentry.captureMessage(message, Sentry.Severity.Debug)
        return
      case LogLevel.INFO:
        Sentry.captureMessage(message, Sentry.Severity.Info)
        return
      case LogLevel.WARN:
        Sentry.captureMessage(message, Sentry.Severity.Warning)
        return
      case LogLevel.ERROR:
        Sentry.captureMessage(message, Sentry.Severity.Error)
        return
    }
  }
}
