type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private log(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    console[level](logMessage, meta || '');

    // In production, send to logging service (e.g., Sentry, LogRocket)
  }

  info(message: string, meta?: unknown) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: unknown) {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error | unknown) {
    this.log('error', message, error);
  }

  debug(message: string, meta?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, meta);
    }
  }
}

export const logger = new Logger();