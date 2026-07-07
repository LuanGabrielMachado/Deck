import { ENV } from "./_core/env";
import { log } from "./_core/logger";

type StorageConfig = { url: string; serviceRoleKey: string; bucket: string };

function getStorageConfig(): StorageConfig {
  const url = ENV.supabaseUrl;
  const serviceRoleKey = ENV.supabaseServiceRoleKey;
  const bucket = ENV.supabaseStorageBucket || "posts";

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase storage credentials missing: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return { url: url.replace(/\/+$/, ""), serviceRoleKey, bucket };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function buildObjectUrl(baseUrl: string, bucket: string, relKey: string): string {
  return `${baseUrl}/storage/v1/object/${bucket}/${normalizeKey(relKey)}`;
}

function buildPublicUrl(baseUrl: string, bucket: string, relKey: string): string {
  return `${baseUrl}/storage/v1/object/public/${bucket}/${normalizeKey(relKey)}`;
}

function buildAuthHeaders(serviceRoleKey: string, contentType?: string): HeadersInit {
  return {
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
    ...(contentType ? { "Content-Type": contentType } : {}),
    "x-upsert": "true",
  };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const { url, serviceRoleKey, bucket } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildObjectUrl(url, bucket, key);

  // Converter para Blob — tipo aceito sem ambiguidade como BodyInit
  let bodyData: Blob | string;
  if (typeof data === 'string') {
    bodyData = data;
  } else {
    const ab = new ArrayBuffer(data.byteLength);
    new Uint8Array(ab).set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
    bodyData = new Blob([ab], { type: contentType });
  }

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: buildAuthHeaders(serviceRoleKey, contentType),
      body: bodyData,
    });

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      log.error('upload', 'Supabase Storage upload falhou', {
        meta: { key, status: response.status, message },
      });
      throw new Error(
        `Storage upload failed (${response.status} ${response.statusText}): ${message}`,
      );
    }

    const publicUrl = buildPublicUrl(url, bucket, key);
    return { key, url: publicUrl };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('upload', 'Erro inesperado no upload do Storage', {
      meta: { key: normalizeKey(relKey), error: errorMessage },
    });
    throw error;
  }
}

/**
 * Remove um objeto do Supabase Storage.
 * Extrai a chave relativa a partir da URL pública.
 * Falha silenciosa — não bloqueia operações principais.
 *
 * @param imageUrl - URL pública completa do objeto (ex: .../public/posts/123_456.jpg)
 */
export async function storageDelete(imageUrl: string): Promise<void> {
  try {
    const { url, serviceRoleKey, bucket } = getStorageConfig();

    const publicPrefix = `/storage/v1/object/public/${bucket}/`;
    const idx = imageUrl.indexOf(publicPrefix);
    if (idx === -1) {
      log.warn('upload', 'Storage delete ignorado — URL fora do bucket', { meta: { imageUrl } });
      return;
    }

    const relKey = imageUrl.slice(idx + publicPrefix.length);
    if (!relKey) {
      log.warn('upload', 'Storage delete ignorado — chave vazia');
      return;
    }

    const deleteUrl = `${url}/storage/v1/object/${bucket}/${relKey}`;

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
    });

    if (!response.ok) {
      log.warn('upload', 'Storage delete retornou erro', {
        meta: { key: relKey, status: response.status },
      });
    }
  } catch (error) {
    // Falha silenciosa — nunca bloquear a operação principal
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.warn('upload', 'Storage delete falhou (ignorado)', { meta: { error: errorMessage } });
  }
}
