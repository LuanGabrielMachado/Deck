/**
 * Camada 1 do sistema de rate limit híbrido.
 *
 * Guarda o timestamp do último post no CloudStorage (Telegram) + localStorage fallback.
 * CloudStorage: sincronizado com a conta Telegram (persiste entre dispositivos).
 * localStorage: fallback imediato para quando CloudStorage não estiver disponível.
 *
 * Estratégia "mais restritivo vence":
 *   1. CloudStorage (async) → fonte primária (sincronizada entre dispositivos)
 *   2. localStorage (sync) → fallback imediato (baixa latência)
 *   3. Servidor (users.lastPostAt) → fonte da verdade (sempre consulta)
 *
 * ⚠️ NÃO limpar o cache ao deletar um post — o rate limit persiste após o delete.
 */

const CACHE_KEY = '@deck/last-post-timestamp';
export const POST_INTERVAL_MS = 10 * 60 * 1000; // 10 minutos

interface RateLimitCache {
  lastPostTimestamp: number;
}

/** Acesso type-safe ao CloudStorage via window.Telegram já tipado */
function getCloudStorage() {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp?.CloudStorage ?? null;
}

/**
 * Lê o cache do CloudStorage (Telegram) com fallback para localStorage.
 * Retorna null se vazio ou inválido.
 */
export async function getRateLimitCache(): Promise<RateLimitCache | null> {
  if (typeof window === 'undefined') return null;

  // Tenta CloudStorage primeiro (assíncrono)
  const cloudStorage = getCloudStorage();
  if (cloudStorage) {
    try {
      const cloudValue = await new Promise<string | null>((resolve) => {
        cloudStorage.getItem(CACHE_KEY, (err, value) => {
          resolve(err ? null : value ?? null);
        });
      });

      if (cloudValue) {
        const parsed = JSON.parse(cloudValue) as unknown;
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          'lastPostTimestamp' in parsed &&
          typeof (parsed as RateLimitCache).lastPostTimestamp === 'number'
        ) {
          return parsed as RateLimitCache;
        }
      }
    } catch {
      // CloudStorage falhou, tenta localStorage
    }
  }

  // Fallback para localStorage
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'lastPostTimestamp' in parsed &&
      typeof (parsed as RateLimitCache).lastPostTimestamp === 'number'
    ) {
      return parsed as RateLimitCache;
    }
    clearRateLimitCache();
    return null;
  } catch {
    clearRateLimitCache();
    return null;
  }
}

/**
 * Salva o timestamp do último post no CloudStorage + localStorage.
 * CloudStorage é assíncrono, localStorage é síncrono (fallback imediato).
 */
export function setRateLimitCache(timestamp: number = Date.now()): void {
  if (typeof window === 'undefined') return;

  const data: RateLimitCache = { lastPostTimestamp: timestamp };
  const serialized = JSON.stringify(data);

  // Salva no CloudStorage (assíncrono, fire-and-forget)
  const cloudStorage = getCloudStorage();
  if (cloudStorage) {
    try {
      cloudStorage.setItem(CACHE_KEY, serialized);
    } catch {
      // CloudStorage falhou, localStorage já foi salvo abaixo
    }
  }

  // Salva no localStorage (síncrono, fallback imediato)
  try {
    localStorage.setItem(CACHE_KEY, serialized);
  } catch {
    // localStorage pode estar desativado (modo privado, etc.) — silencia
  }
}

/** Remove o cache do CloudStorage + localStorage */
export function clearRateLimitCache(): void {
  if (typeof window === 'undefined') return;

  const cloudStorage = getCloudStorage();
  if (cloudStorage) {
    try {
      cloudStorage.removeItem(CACHE_KEY);
    } catch {
      // silencia
    }
  }

  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // silencia
  }
}

/**
 * Verifica o cache local e retorna se o usuário pode postar.
 *
 * @param lastPostTimestamp timestamp (ms) do último post, ou null se nunca postou
 */
export function checkLocalRateLimit(lastPostTimestamp: number | null): {
  canPost: boolean;
  timeRemainingMs?: number;
} {
  if (lastPostTimestamp === null) return { canPost: true };
  const timeSince = Date.now() - lastPostTimestamp;
  if (timeSince < POST_INTERVAL_MS) {
    return { canPost: false, timeRemainingMs: POST_INTERVAL_MS - timeSince };
  }
  return { canPost: true };
}
