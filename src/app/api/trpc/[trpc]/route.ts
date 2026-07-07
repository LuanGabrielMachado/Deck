import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers';
import { createContext } from '@/server/_core/context';

// Configuração para Vercel Serverless
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    responseMeta({ ctx }) {
      if (ctx?.responseCookies?.length) {
        return {
          headers: {
            'set-cookie': ctx.responseCookies,
          },
        };
      }
      return {};
    },
  });

export { handler as GET, handler as POST };
