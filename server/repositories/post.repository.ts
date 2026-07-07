/**
 * Post Repository - Operações de banco de dados para posts.
 * 
 * Responsável por todas as operações na tabela `posts`.
 * Mantém coerência com arquitetura tRPC + Drizzle ORM.
 */

import { eq, desc, inArray, and, or, not, sql, gte, lt } from "drizzle-orm";
import { getDb } from "../db";
import { users, posts, follows } from "../../drizzle/schema";
import type { Post, InsertPost } from "../../drizzle/schema";
import { ENV } from "../_core/env";
import { storageDelete } from "../storage";
import { getBlockedUsersSubquery } from "./block.repository";
import { getGhostedAuthorsSubquery } from "./ghost.repository";

// ─────────────────────────────────────────────────────────────────────────────
// Create & Delete
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cria um novo post.
 * mentionedUsersJson: JSON.stringify dos usuários mencionados (snapshot) — já serializado.
 */
export async function createPost(data: InsertPost & {
  replyToPostId?: number | null;
  mentionedUsersJson?: string | null;
}): Promise<number> {
  const db = getDb();
  const result = await db.insert(posts).values({
    telegramId: data.telegramId,
    content: data.content,
    imagePath: data.imagePath,
    replyToPostId: data.replyToPostId ?? null,
    mentionedUsers: data.mentionedUsersJson ?? null,
  }).returning({ id: posts.id });
  return result[0].id;
}

/**
 * Deleta post do usuário (ownership validation).
 * reactions são removidas automaticamente via ON DELETE CASCADE no banco.
 */
export async function deletePost(postId: number, telegramId: number): Promise<Post | null> {
  const db = getDb();
  const post = await db.query.posts.findFirst({
    where: and(eq(posts.id, postId), eq(posts.telegramId, telegramId)),
  });

  if (!post) {
    throw new Error("Post não encontrado ou você não tem permissão para deletá-lo.");
  }

  await db.delete(posts).where(eq(posts.id, postId));

  // Limpa imagem do Storage (fire-and-forget)
  if (post.imagePath) {
    void storageDelete(post.imagePath);
  }

  return post;
}

/**
 * Admin deleta qualquer post (independente do autor).
 * reactions são removidas automaticamente via ON DELETE CASCADE no banco.
 */
export async function deleteAnyPost(postId: number): Promise<Post | null> {
  const db = getDb();
  const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  if (!post) return null;

  await db.delete(posts).where(eq(posts.id, postId));

  // Limpa imagem do Storage (fire-and-forget)
  if (post.imagePath) {
    void storageDelete(post.imagePath);
  }

  return post;
}

// ─────────────────────────────────────────────────────────────────────────────
// Timeline & Feed
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retorna timeline com cursor-based pagination (id DESC).
 * Respeita feedMode, shadow ban e efemeridade (7 dias, admin isento).
 */
export async function getTimelinePosts(
  telegramId: number,
  limit: number = 20,
  cursor: number | undefined = undefined,
  feedMode: 'following' | 'all' = 'following',
  isAdmin: boolean = false,
): Promise<{ posts: Post[]; nextCursor?: number }> {
  const db = getDb();

  // Validar e clampar limites para prevenir DoS
  const safeLimit = Math.min(Math.max(limit, 1), 100); // Mínimo 1, máximo 100

  // Efemeridade: 7 dias (admin isento)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const adminIds = ENV.adminTelegramIds;

  // Subquery: apenas usuários sem shadow ban
  const nonBannedUsers = db
    .select({ id: users.telegramId })
    .from(users)
    .where(eq(users.shadowBanned, false));

  // Subquery: usuários bloqueados ou que bloquearam o viewer (admin não filtra)
  const blockedUsers = !isAdmin ? getBlockedUsersSubquery(telegramId) : null;

  // Subquery: autores que ghostaram o viewer e ainda não expiraram (admin não filtra)
  const ghostedAuthors = !isAdmin ? getGhostedAuthorsSubquery(telegramId) : null;

  // Filtro de efemeridade
  const ephemeralFilter = adminIds.length > 0
    ? or(gte(posts.createdAt, sevenDaysAgo), inArray(posts.telegramId, adminIds))
    : gte(posts.createdAt, sevenDaysAgo);

  // Filtro cursor
  const cursorFilter = cursor !== undefined ? lt(posts.id, cursor) : undefined;

  // Busca limit+1 para saber se há próxima página
  const fetchLimit = safeLimit + 1;

  const buildWithClause = () => ({
    author: {
      columns: { telegramId: true, name: true, photoUrl: true },
    },
    replyToPost: {
      columns: { id: true, content: true, telegramId: true },
      with: { author: { columns: { name: true } } },
    },
  } as const);

  let rows;

  if (isAdmin || feedMode === 'all') {
    const baseFilter = isAdmin
      ? ephemeralFilter
      : and(
          inArray(posts.telegramId, nonBannedUsers),
          ephemeralFilter,
          blockedUsers    ? not(inArray(posts.telegramId, blockedUsers))    : undefined,
          ghostedAuthors  ? not(inArray(posts.telegramId, ghostedAuthors))  : undefined,
        );

    const whereClause = cursorFilter ? and(baseFilter, cursorFilter) : baseFilter;

    rows = await db.query.posts.findMany({
      where: whereClause,
      orderBy: desc(posts.id),
      limit: fetchLimit,
      with: buildWithClause(),
    });
  } else {
    const followedUsersQuery = db
      .select({ id: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, telegramId));

    const authorFilter = adminIds.length > 0
      ? or(
          inArray(posts.telegramId, followedUsersQuery),
          eq(posts.telegramId, telegramId),
          inArray(posts.telegramId, adminIds),
        )
      : or(
          inArray(posts.telegramId, followedUsersQuery),
          eq(posts.telegramId, telegramId),
        );

    const baseFilter = and(
      authorFilter,
      inArray(posts.telegramId, nonBannedUsers),
      ephemeralFilter,
      blockedUsers    ? not(inArray(posts.telegramId, blockedUsers))    : undefined,
      ghostedAuthors  ? not(inArray(posts.telegramId, ghostedAuthors))  : undefined,
    );
    const whereClause = cursorFilter ? and(baseFilter, cursorFilter) : baseFilter;

    rows = await db.query.posts.findMany({
      where: whereClause,
      orderBy: desc(posts.id),
      limit: fetchLimit,
      with: buildWithClause(),
    });
  }

  // Determina próximo cursor (usa safeLimit — valor clamped, nunca raw)
  const hasMore = rows.length > safeLimit;
  const items = hasMore ? rows.slice(0, safeLimit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

  return { posts: items, nextCursor };
}

export type UserPost = {
  id: number;
  telegramId: number;
  content: string;
  imagePath: string | null;
  createdAt: Date;
  replyToPostId: number | null;
  author: { telegramId: number; name: string | null; photoUrl: string | null } | null;
  replyToPost: {
    id: number;
    content: string;
    telegramId: number;
    author: { name: string | null } | null;
  } | null;
};

/**
 * Retorna posts de um usuário específico (com efemeridade).
 * Inclui author e replyToPost nas queries.
 * Usa cursor-based pagination (id DESC) para performance.
 */
export async function getUserPosts(
  telegramId: number,
  limit: number = 50,
  cursor: number | undefined = undefined,
  isAdmin: boolean = false,
): Promise<{ posts: UserPost[]; nextCursor?: number }> {
  const db = getDb();

  // Validar e clampar limites
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const adminIds = ENV.adminTelegramIds;

  let whereClause;
  if (isAdmin) {
    whereClause = cursor !== undefined
      ? and(eq(posts.telegramId, telegramId), lt(posts.id, cursor))
      : eq(posts.telegramId, telegramId);
  } else {
    const ephemeralFilter = adminIds.length > 0 && adminIds.includes(telegramId)
      ? eq(posts.telegramId, telegramId)
      : and(eq(posts.telegramId, telegramId), gte(posts.createdAt, sevenDaysAgo));
    whereClause = cursor !== undefined
      ? and(ephemeralFilter, lt(posts.id, cursor))
      : ephemeralFilter;
  }

  // Busca limit+1 para saber se há próxima página
  const fetchLimit = safeLimit + 1;

  const rows = await db.query.posts.findMany({
    where: whereClause,
    orderBy: desc(posts.id),
    limit: fetchLimit,
    with: {
      author: {
        columns: { telegramId: true, name: true, photoUrl: true },
      },
      replyToPost: {
        columns: { id: true, content: true, telegramId: true },
        with: { author: { columns: { name: true } } },
      },
    },
  });

  // Determina próximo cursor
  const hasMore = rows.length > safeLimit;
  const items = hasMore ? rows.slice(0, safeLimit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

  return { posts: items, nextCursor };
}

/**
 * Contagem de posts de um usuário (com efemeridade).
 */
export async function countUserPosts(
  telegramId: number,
  isAdmin: boolean = false,
): Promise<number> {
  const db = getDb();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const adminIds = ENV.adminTelegramIds;

  let whereClause;
  if (isAdmin || (adminIds.length > 0 && adminIds.includes(telegramId))) {
    whereClause = eq(posts.telegramId, telegramId);
  } else {
    whereClause = and(eq(posts.telegramId, telegramId), gte(posts.createdAt, sevenDaysAgo));
  }

  const result = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(posts)
    .where(whereClause);
  return result[0]?.count ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Post By ID
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Versão leve: retorna apenas telegramId + content (para notificações).
 */
export async function getPostBasicById(postId: number) {
  const db = getDb();
  const result = await db
    .select({ telegramId: posts.telegramId, content: posts.content })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Versão completa: retorna post com author e replyToPost.
 */
export async function getPostById(postId: number) {
  const db = getDb();
  const result = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    with: {
      author: true,
      replyToPost: {
        columns: { id: true, content: true, telegramId: true },
        with: { author: { columns: { name: true } } },
      },
    },
  });
  return result ?? null;
}

/**
 * Limpeza de posts efêmeros expirados (> 7 dias).
 * Admin posts são isentos.
 * reactions são removidas automaticamente via ON DELETE CASCADE.
 * Retorna número de posts deletados.
 */
export async function cleanupExpiredPosts(): Promise<number> {
  const db = getDb();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const adminIds = ENV.adminTelegramIds;

  const notAdminFilter = adminIds.length > 0
    ? not(inArray(posts.telegramId, adminIds))
    : undefined;

  const expiredPosts = await db
    .select({ id: posts.id, imagePath: posts.imagePath })
    .from(posts)
    .where(and(lt(posts.createdAt, sevenDaysAgo), notAdminFilter));

  if (expiredPosts.length === 0) return 0;

  const expiredIds = expiredPosts.map(p => p.id);

  // CASCADE remove reactions automaticamente — só precisa deletar os posts
  await db.delete(posts).where(inArray(posts.id, expiredIds));

  // Limpa imagens do storage (fire-and-forget)
  for (const post of expiredPosts) {
    if (post.imagePath) {
      void storageDelete(post.imagePath);
    }
  }

  return expiredIds.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// Thread
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retorna respostas diretas a um post (uma camada).
 * Cursor-based pagination, mais recente primeiro.
 * Shadow ban e bloqueios aplicados — admin vê tudo.
 */
export async function getThreadReplies(
  parentPostId: number,
  viewerTelegramId: number,
  limit: number = 20,
  cursor: number | undefined = undefined,
  isAdmin: boolean = false,
): Promise<{ posts: Post[]; nextCursor?: number }> {
  const db = getDb();
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const fetchLimit = safeLimit + 1;

  const nonBannedUsers = db
    .select({ id: users.telegramId })
    .from(users)
    .where(eq(users.shadowBanned, false));

  const blockedUsers    = !isAdmin ? getBlockedUsersSubquery(viewerTelegramId) : null;
  const ghostedAuthors  = !isAdmin ? getGhostedAuthorsSubquery(viewerTelegramId) : null;

  const baseFilter = isAdmin
    ? eq(posts.replyToPostId, parentPostId)
    : and(
        eq(posts.replyToPostId, parentPostId),
        inArray(posts.telegramId, nonBannedUsers),
        blockedUsers   ? not(inArray(posts.telegramId, blockedUsers))   : undefined,
        ghostedAuthors ? not(inArray(posts.telegramId, ghostedAuthors)) : undefined,
      );

  const whereClause = cursor !== undefined ? and(baseFilter, lt(posts.id, cursor)) : baseFilter;

  const rows = await db.query.posts.findMany({
    where: whereClause,
    orderBy: desc(posts.id),
    limit: fetchLimit,
    with: {
      author: { columns: { telegramId: true, name: true, photoUrl: true } },
      replyToPost: {
        columns: { id: true, content: true, telegramId: true },
        with: { author: { columns: { name: true } } },
      },
    },
  });

  const hasMore = rows.length > safeLimit;
  const items   = hasMore ? rows.slice(0, safeLimit) : rows;
  return { posts: items, nextCursor: hasMore ? items[items.length - 1]?.id : undefined };
}

/**
 * Conta respostas diretas a um post (para exibir o badge "Ver thread").
 * Admin vê todas; usuário normal filtra shadow-ban.
 */
export async function getReplyCount(
  postId: number,
  isAdmin: boolean = false,
): Promise<number> {
  const db = getDb();

  const nonBannedUsers = db
    .select({ id: users.telegramId })
    .from(users)
    .where(eq(users.shadowBanned, false));

  const whereClause = isAdmin
    ? eq(posts.replyToPostId, postId)
    : and(
        eq(posts.replyToPostId, postId),
        inArray(posts.telegramId, nonBannedUsers),
      );

  const result = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(posts)
    .where(whereClause);

  return result[0]?.count ?? 0;
}

/**
 * Retorna posts de broadcast do admin (para listagem no painel).
 * Ordenados por mais recente, sem filtro de efemeridade (admin é isento).
 */
export async function getBroadcastPosts(
  adminTelegramId: number,
  limit = 20,
): Promise<{ id: number; content: string; createdAt: Date }[]> {
  const db = getDb();
  const rows = await db.query.posts.findMany({
    where: eq(posts.telegramId, adminTelegramId),
    orderBy: desc(posts.id),
    limit,
    columns: { id: true, content: true, createdAt: true },
  });
  return rows;
}
