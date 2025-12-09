import winston from 'winston';
import { AsyncLocalStorage } from 'async_hooks';

// Request context for tracing
interface LogContext {
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

// AsyncLocalStorage for request context propagation
export const asyncLocalStorage = new AsyncLocalStorage<LogContext>();
export const getRequestContext = (): LogContext => asyncLocalStorage.getStore() || {};
export const runWithContext = <T>(context: LogContext, fn: () => T): T => asyncLocalStorage.run(context, fn);

// Config
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';
const SERVICE_NAME = process.env.SERVICE_NAME || 'my-list-api';
const IS_PROD = NODE_ENV === 'production';

// Add request context to logs
const contextFormat = winston.format((info) => {
  const ctx = getRequestContext();
  if (ctx.requestId) info.requestId = ctx.requestId;
  if (ctx.userId) info.userId = ctx.userId;
  return info;
});

// Development: Pretty colorized output
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  contextFormat(),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp, requestId, userId, ...meta }) => {
    let out = `[${timestamp}] ${level}: ${message}`;
    if (requestId || userId) {
      out += ` [${requestId ? `req:${String(requestId).slice(0, 8)}` : ''}${userId ? ` user:${String(userId).slice(0, 8)}` : ''}]`;
    }
    const rest = Object.keys(meta).length ? meta : null;
    if (rest) out += `\n  └─ ${JSON.stringify(rest)}`;
    return out;
  })
);

// Production: JSON structured logs
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  contextFormat(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create Winston logger
const winstonLogger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: { service: SERVICE_NAME, env: NODE_ENV },
  format: IS_PROD ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console({ stderrLevels: ['error', 'warn'] }),
  ],
  exitOnError: false,
});

// File transports for production
if (IS_PROD) {
  winstonLogger.add(new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error',
    maxsize: 5242880,
    maxFiles: 5,
  }));
  winstonLogger.add(new winston.transports.File({ 
    filename: 'logs/combined.log',
    maxsize: 5242880,
    maxFiles: 5,
  }));
}

// Logger API
export const logger = {
  debug: (msg: string, meta?: object): void => { winstonLogger.debug(msg, meta); },
  info: (msg: string, meta?: object): void => { winstonLogger.info(msg, meta); },
  warn: (msg: string, meta?: object): void => { winstonLogger.warn(msg, meta); },
  error: (msg: string, err?: Error | object, meta?: object): void => {
    if (err instanceof Error) {
      winstonLogger.error(msg, { error: { name: err.name, message: err.message, stack: err.stack }, ...meta });
    } else {
      winstonLogger.error(msg, { ...err, ...meta });
    }
  },
  fatal: (msg: string, err?: Error | object, meta?: object): void => {
    if (err instanceof Error) {
      winstonLogger.error(msg, { fatal: true, error: { name: err.name, message: err.message, stack: err.stack }, ...meta });
    } else {
      winstonLogger.error(msg, { fatal: true, ...err, ...meta });
    }
  },
  http: (data: { method: string; url: string; statusCode: number; responseTime: number; [k: string]: unknown }): void => {
    const level = data.statusCode >= 500 ? 'error' : data.statusCode >= 400 ? 'warn' : 'info';
    winstonLogger.log(level, `${data.method} ${data.url} ${data.statusCode} ${data.responseTime}ms`, { http: data });
  },
  startup: (data: { port: number; environment: string }): void => {
    if (!IS_PROD) {
      console.log(`\n\x1b[36m╔════════════════════════════════════════╗\x1b[0m`);
      console.log(`\x1b[36m║\x1b[0m  \x1b[1m\x1b[32m🚀 ${SERVICE_NAME.toUpperCase()}\x1b[0m`);
      console.log(`\x1b[36m╠════════════════════════════════════════╣\x1b[0m`);
      console.log(`\x1b[36m║\x1b[0m  Port: \x1b[33m${data.port}\x1b[0m  Env: \x1b[33m${data.environment}\x1b[0m  Log: \x1b[33m${LOG_LEVEL}\x1b[0m`);
      console.log(`\x1b[36m╚════════════════════════════════════════╝\x1b[0m\n`);
    } else {
      winstonLogger.info('Server started', data);
    }
  },
  shutdown: (reason: string): void => { winstonLogger.warn(`Server shutting down: ${reason}`); },
};

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export default logger;
