/**
 * LRU Cache para vídeos com limite de 10 itens.
 * Previne memory leak em sessões longas.
 */
const MAX_CACHE_SIZE = 10;
const srcCache = new Map<string, string>();
const loadingCache = new Map<string, Promise<string>>();

/**
 * Move uma chave para o final do Map (mais recente).
 * Maps mantêm ordem de inserção no ES2015+.
 */
function touchKey<K, V>(map: Map<K, V>, key: K): void {
  const value = map.get(key);
  if (value !== undefined) {
    map.delete(key);
    map.set(key, value);
  }
}

/**
 * Carrega vídeo com cache LRU.
 * Se já estiver em cache, retorna a object URL cached.
 * Caso contrário, faz fetch e cria uma nova object URL.
 * 
 * @param src - URL do vídeo a ser carregado
 * @returns Promise com a object URL ou a URL original em caso de erro
 */
async function carregarVideoComCache(src: string): Promise<string> {
  if (typeof window === 'undefined') {
    return src;
  }

  const srcEmCache = srcCache.get(src);
  if (srcEmCache) {
    // Move para o final (mais recente)
    touchKey(srcCache, src);
    return srcEmCache;
  }

  const carregamentoEmAndamento = loadingCache.get(src);
  if (carregamentoEmAndamento) {
    return carregamentoEmAndamento;
  }

  const promessa = fetch(src, { cache: 'force-cache' })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Falha ao carregar vídeo: ${response.status}`);
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // LRU: remove o mais antigo se excedeu limite
      if (srcCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = srcCache.keys().next().value;
        if (oldestKey) {
          const oldestUrl = srcCache.get(oldestKey);
          if (oldestUrl) {
            try { URL.revokeObjectURL(oldestUrl); } catch {}
          }
          srcCache.delete(oldestKey);
        }
      }
      
      srcCache.set(src, objectUrl);
      return objectUrl;
    })
    .catch(() => src)
    .finally(() => {
      loadingCache.delete(src);
    });

  loadingCache.set(src, promessa);
  return promessa;
}

/**
 * Obtém vídeo do cache ou carrega se não estiver presente.
 * 
 * @param src - URL do vídeo
 * @returns Promise com a object URL cached ou URL original
 */
export async function obterVideoCacheado(src: string): Promise<string> {
  return carregarVideoComCache(src);
}

/**
 * Aquece o cache de vídeo em background.
 * Inicia o carregamento sem aguardar conclusão.
 * 
 * @param src - URL do vídeo a ser pré-carregado
 */
export function aquecerVideoCache(src: string): void {
  void carregarVideoComCache(src);
}

/**
 * Limpa o cache de vídeos e revoga TODAS as object URLs criadas.
 * Previne memory leak em sessões longas.
 * Também cancela promises pendentes para evitar vazamentos.
 */
export function clearVideoCache(): void {
  // Cancela promises pendentes (elas vão resolver mas não vão cachar)
  loadingCache.forEach((promise) => {
    promise.catch(() => {}); // Evita unhandled rejection
  });
  loadingCache.clear();
  
  // Revoga todas as URLs em cache
  srcCache.forEach((objectUrl) => {
    try {
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Ignora erros ao revogar (URL já pode ter sido revogada ou inválida)
    }
  });
  srcCache.clear();
}
