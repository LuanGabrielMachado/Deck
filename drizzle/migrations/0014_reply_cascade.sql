-- Migration 0014: adiciona FK com CASCADE em posts.replyToPostId
-- Garante que replies são deletadas em cascata quando o post original expira.

ALTER TABLE "posts" ADD CONSTRAINT "posts_replyToPostId_fkey" FOREIGN KEY ("replyToPostId") REFERENCES "posts"("id") ON DELETE CASCADE;
