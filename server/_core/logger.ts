/**
 * LogVault — logger estruturado do servidor.
 *
 * Interface simples: log.info / log.warn / log.error
 * Fire-and-forget: nunca bloqueia, nunca lança exceção.
 * Em desenvolvimento, também escreve no console para facilitar debug.
 *
 * @example
 * log.warn('notification', 'Bot retornou 403 — desativando notificações', {
 *   actorId: 12345,
 *   meta: { errorCode: 403 },
 * });
 */

import { insertLog, type LogLevel, type LogContext } from '../repositories/log.repository';
import { ENV } from './env';

interface LogOptions {
  actorId?: number | null;
  meta?: Record<string, unknown> | null;
}

function write(level: LogLevel, context: LogContext, message: string, opts: LogOptions = {}): void {
  // Escreve no banco de forma assíncrona sem aguardar
  void insertLog({ level, context, message, ...opts });

  // Em dev, espelha no console para DX
  if (!ENV.isProduction) {
    const prefix = `[${level.toUpperCase()}][${context}]`;
    if (level === 'error') console.error(prefix, message, opts.meta ?? '');
    else if (level === 'warn') console.warn(prefix, message, opts.meta ?? '');
    else console.log(prefix, message, opts.meta ?? '');
  }
}

export const log = {
  info:  (context: LogContext, message: string, opts?: LogOptions) => write('info',  context, message, opts),
  warn:  (context: LogContext, message: string, opts?: LogOptions) => write('warn',  context, message, opts),
  error: (context: LogContext, message: string, opts?: LogOptions) => write('error', context, message, opts),
};
