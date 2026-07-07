import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredPosts } from '@/server/repositories/post.repository';
import { log } from '@/server/_core/logger';

/**
 * Cron endpoint para limpeza de posts expirados (> 7 dias, exceto admin).
 * Protegido por CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const deletedCount = await cleanupExpiredPosts();

    log.info('cron', 'Cron de limpeza concluído', {
      meta: { deletedPosts: deletedCount },
    });

    return NextResponse.json({
      success: true,
      deletedPosts: deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    log.error('cron', 'Cron de limpeza falhou', { meta: { error: errMsg } });
    return NextResponse.json(
      { error: 'Cleanup failed', details: errMsg },
      { status: 500 }
    );
  }
}
