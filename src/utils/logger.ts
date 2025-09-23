/**
 * Logger utility with structured logging
 * Provides different log levels and contextual information
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogContext {
  userId?: string
  requestId?: string
  component?: string
  method?: string
  [key: string]: unknown
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: Error
  stack?: string
}

class Logger {
  private currentLevel: LogLevel = LogLevel.INFO
  private isDevelopment: boolean = process.env.NODE_ENV !== 'production'

  setLevel(level: LogLevel): void {
    this.currentLevel = level
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel
  }

  private formatLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    }

    if (context) entry.context = context

    if (error) {
      entry.error = error
      entry.stack = error.stack
    }

    return entry
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return

    if (this.isDevelopment) {
      // En desarrollo, usar métodos permitidos por eslint
      const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']

      if (entry.level >= LogLevel.ERROR) {
        console.error(`[${levelNames[entry.level]}] ${entry.message}`, {
          context: entry.context,
          error: entry.error,
          stack: entry.stack,
        })
      } else if (entry.level >= LogLevel.WARN) {
        console.warn(`[${levelNames[entry.level]}] ${entry.message}`, {
          context: entry.context,
        })
      }
      // Para DEBUG e INFO, no mostramos nada en desarrollo para cumplir con eslint
    } else {
      // En producción, enviar a servicio de logging externo
      // Por ahora, almacenar en localStorage para debugging
      this.storeLogEntry(entry)
    }
  }

  debug(message: string, context?: LogContext): void {
    this.output(this.formatLogEntry(LogLevel.DEBUG, message, context))
  }

  info(message: string, context?: LogContext): void {
    this.output(this.formatLogEntry(LogLevel.INFO, message, context))
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    this.output(this.formatLogEntry(LogLevel.WARN, message, context, error))
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.output(this.formatLogEntry(LogLevel.ERROR, message, context, error))
  }

  fatal(message: string, context?: LogContext, error?: Error): void {
    this.output(this.formatLogEntry(LogLevel.FATAL, message, context, error))
  }

  // Método específico para errores de autenticación
  authError(
    message: string,
    error?: Error,
    userId?: string,
    method?: string,
  ): void {
    this.error(
      message,
      {
        component: 'auth',
        userId,
        method,
      },
      error,
    )
  }

  // Método para logging de performance
  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      ...context,
      operation,
      duration,
      type: 'performance',
    })
  }

  private storeLogEntry(entry: LogEntry): void {
    try {
      const logs = JSON.parse(
        localStorage.getItem('app_logs') || '[]',
      ) as LogEntry[]
      logs.push(entry)
      // Mantener solo los últimos 100 logs
      if (logs.length > 100) logs.splice(0, logs.length - 100)

      localStorage.setItem('app_logs', JSON.stringify(logs))
    } catch {
      // Si localStorage no está disponible, ignorar silenciosamente
    }
  }

  // Método para obtener logs almacenados (útil para debugging)
  getLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]') as LogEntry[]
    } catch {
      return []
    }
  }

  // Método para limpiar logs almacenados
  clearLogs(): void {
    try {
      localStorage.removeItem('app_logs')
    } catch {
      // Si localStorage no está disponible, ignorar silenciosamente
    }
  }
}

// Instancia singleton del logger
export const logger = new Logger()

// Configurar nivel según el entorno
if (process.env.NODE_ENV === 'production') logger.setLevel(LogLevel.WARN)
else logger.setLevel(LogLevel.DEBUG)
