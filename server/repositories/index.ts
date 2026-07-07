/**
 * Repositories - Barrel export de todos os repositórios.
 *
 * Estrutura modular para operações de banco de dados.
 * Cada repositório é responsável por um domínio específico.
 *
 * @example
 * ```typescript
 * import {
 *   createPost,
 *   getUserByTelegramId,
 *   followUser,
 * } from '@/server/repositories';
 * ```
 */

// ─── Database Connection ────────────────────────────────────────────
export { getDb } from '../db';

// ─── User Repository ────────────────────────────────────────────────
export {
  upsertTelegramUser,
  getUserByTelegramId,
  getUserByTelegramIdForNotifications,
  getUserForAdmin,
  searchUsersByName,
  getSuggestedUsers,
  setUserNotificationsEnabled,
  disableUserNotifications,
  getUserFeedMode,
  setUserFeedMode,
  updateUserLastPostAt,
  updateUserLastReplyAt,
  resetUserRateLimit,
  setUserBanned,
  setUserShadowBanned,
  getUsersByTelegramIds,
  deleteAccount,
} from './user.repository';

// ─── Post Repository ────────────────────────────────────────────────
export {
  createPost,
  deletePost,
  deleteAnyPost,
  getTimelinePosts,
  getUserPosts,
  countUserPosts,
  getPostBasicById,
  getPostById,
  cleanupExpiredPosts,
  getBroadcastPosts,
  getThreadReplies,
  getReplyCount,
} from './post.repository';

// ─── Follow Repository ──────────────────────────────────────────────
export {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowing,
} from './follow.repository';

// ─── Reaction Repository ────────────────────────────────────────────
export {
  addReaction,
  removeReaction,
  getReactionsByPost,
} from './reaction.repository';

// ─── Admin Repository ───────────────────────────────────────────────
export {
  getAdminStats,
  logAdminAction,
  getRecentAdminActions,
} from './admin.repository';

// ─── Config Repository ──────────────────────────────────────────────
export {
  getServerFlag,
  setServerFlag,
  getAllServerFlags,
} from './config.repository';

// ─── Notification Repository ────────────────────────────────────────
export {
  insertNotification,
  markNotificationSent,
  markNotificationFailed,
  getPendingNotifications,
  getReplyContent,
} from './notification.repository';

// ─── Log Repository — LogVault ──────────────────────────────────────
export {
  insertLog,
  getLogs,
} from './log.repository';
export type { LogLevel, LogContext } from './log.repository';

// ─── Block Repository ────────────────────────────────────────────────
export {
  blockUser,
  getBlockedUsersSubquery,
} from './block.repository';

// ─── Ghost Repository ────────────────────────────────────────────────
export {
  ghostUser,
  unghostUser,
  isGhosting,
  getGhostedAuthorsSubquery,
} from './ghost.repository';
