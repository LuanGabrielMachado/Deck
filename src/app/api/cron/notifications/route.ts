import { NextRequest, NextResponse } from 'next/server';
import {
  getPendingNotifications,
  markNotificationSent,
  markNotificationFailed,
  disableUserNotifications,
  getReplyContent,
  getPostBasicById,
} from '@/server/repositories';
import { notifyReply, notifyReaction, notifyFollow, notifyMention } from '@/server/bot/telegram-bot';
import { log } from '@/server/_core/logger';

/**
 * Cron: processa notificações pendentes (retry, max 3 tentativas).
 * Schedule: 1x/dia ao meio-dia UTC (9h BRT) — Plano Hobby Vercel
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pending = await getPendingNotifications(50);
    let sent = 0, failed = 0, skipped = 0;

    for (const notif of pending) {
      // Null safety: actorName pode ser null se usuário foi deletado
      const actorName = (notif.actorName as string | null) ?? 'Alguém';

      // Destinatário desativou notificações — cancela permanentemente
      if (!notif.recipientNotificationsEnabled) {
        await markNotificationFailed(notif.id, 'notifications disabled', true);
        skipped++;
        continue;
      }

      let result;

      if (notif.type === 'reply') {
        // referenceId = ID do post original (o que foi respondido)
        // Precisamos buscar o conteúdo da REPLY (não do post original)
        const replyContent = notif.referenceId
          ? await getReplyContent(notif.referenceId, notif.actorId)
          : null;
        if (!replyContent) {
          await markNotificationFailed(notif.id, 'reply post not found', true);
          skipped++;
          continue;
        }
        result = await notifyReply(notif.recipientId, actorName, replyContent);
      } else if (notif.type === 'reaction') {
        const post = notif.referenceId ? await getPostBasicById(notif.referenceId) : null;
        if (!post) {
          await markNotificationFailed(notif.id, 'referenced post deleted', true);
          skipped++;
          continue;
        }
        const emoji = notif.emoji ?? '🔥';
        result = await notifyReaction(notif.recipientId, actorName, emoji, post.content);
      } else if (notif.type === 'mention') {
        const post = notif.referenceId ? await getPostBasicById(notif.referenceId) : null;
        if (!post) {
          await markNotificationFailed(notif.id, 'mentioned post deleted', true);
          skipped++;
          continue;
        }
        result = await notifyMention(notif.recipientId, actorName, post.content);
      } else {
        // follow — sem referência a post
        result = await notifyFollow(notif.recipientId, actorName);
      }

      if (result.ok) {
        await markNotificationSent(notif.id);
        sent++;
      } else {
        const isPermanent = result.errorCode === 403;
        if (isPermanent) await disableUserNotifications(notif.recipientId);
        await markNotificationFailed(notif.id, result.description ?? 'unknown', isPermanent);
        failed++;
      }
    }

    log.info('cron', 'Cron de notificações concluído', {
      meta: { processed: pending.length, sent, failed, skipped },
    });

    return NextResponse.json({
      success: true,
      processed: pending.length,
      sent,
      failed,
      skipped,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown';
    log.error('cron', 'Cron de notificações falhou', { meta: { error: errMsg } });
    return NextResponse.json(
      { error: 'Notification cron failed', details: errMsg },
      { status: 500 }
    );
  }
}
