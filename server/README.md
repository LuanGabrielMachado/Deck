# Backend Development Guide

This guide covers server-side features including authentication, database, and tRPC API.

---

## File Structure

```
server/
  db.ts              ← Query helpers (add database functions here)
  routers.ts         ← tRPC procedures (add API routes here)
  storage.ts         ← Storage helpers
  _core/             ← Framework-level code (don't modify)
drizzle/
  schema.ts          ← Database tables & types
  relations.ts       ← Table relationships
  migrations/        ← Auto-generated migrations
shared/
  types.ts           ← Shared TypeScript types
lib/
  trpc.ts            ← tRPC client
hooks/
  use-auth.ts        ← Auth state hook
tests/
  *.test.ts          ← Add your tests here
```

---

## Authentication

### Overview

Authentication is handled automatically via the Telegram WebApp SDK. The app detects if it's running inside Telegram and extracts user data securely. The system uses only the Telegram ID as the primary identifier, without any additional OAuth flows.

### Using the Auth Hook

```tsx
import { useAuth } from "@/hooks/use-auth";

function MyScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <ActivityIndicator />;

  if (!user) {
    // This should not happen if the app is opened from Telegram
    return <ThemedText>Please open this app within Telegram.</ThemedText>;
  }

  return (
    <View>
      <ThemedText>Welcome, {user.first_name}</ThemedText>
    </View>
  );
}
```

### User Object

The `user` object from `useAuth` contains Telegram user data:

```tsx
interface User {
  id: number;           // Telegram user ID
  first_name: string;   // First name
  last_name?: string;   // Last name (optional)
  username?: string;    // Username (optional)
  photo_url?: string;   // Photo URL (optional)
  language_code?: string; // Language code (optional)
  is_premium?: boolean; // Premium status (optional)
}
```

### API Authentication

Each tRPC procedure receives the Telegram user ID via the request headers. The authentication is handled transparently by passing the `initData` from the Telegram WebApp SDK.

---

## Database

### Schema Definition

Define your tables in `drizzle/schema.ts`. The project uses PostgreSQL database (e.g., from Supabase).

```tsx
import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Users table - simplified to use Telegram ID as primary key
export const users = pgTable("users", {
  telegramId: integer("telegramId").primaryKey(),  // Telegram user ID as primary key
  name: text("name"),                              // Display name
  photoUrl: text("photoUrl"),                      // Avatar URL
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  telegramId: integer("telegramId")                // Author's Telegram ID
    .notNull()
    .references(() => users.telegramId),
  content: varchar("content", { length: 165 }).notNull(), // 165 char limit
  imagePath: text("imagePath"),                    // Path to image in storage
  telegraphUrl: text("telegraphUrl"),              // Link to Telegraph article
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Follows table - relationship between users
export const follows = pgTable(
  "follows",
  {
    followerId: integer("followerId")               // Follower's Telegram ID
      .notNull()
      .references(() => users.telegramId),
    followingId: integer("followingId")             // Following user's Telegram ID
      .notNull()
      .references(() => users.telegramId),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.followerId, table.followingId] }),
    };
  }
);

// Reactions table - emoji reactions to posts
export const reactions = pgTable(
  "reactions",
  {
    postId: integer("postId")
      .notNull()
      .references(() => posts.id),
    telegramId: integer("telegramId")               // Reactor's Telegram ID
      .notNull()
      .references(() => users.telegramId),
    emoji: varchar("emoji", { length: 10 }).notNull(), // Emoji character
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.postId, table.telegramId, table.emoji] }),
    };
  }
);

// Export types
export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Reaction = typeof reactions.$inferSelect;
```

### Running Migrations

After editing the schema, push changes to your database:

```bash
pnpm db:push
```

---

## tRPC API

Define API routes in `server/routers.ts` and call them from the frontend using the `trpc` hooks. The API is organized into logical routers:

- `telegram`: User authentication and profile
- `users`: User search and suggestions  
- `posts`: Post creation, retrieval, and deletion
- `follows`: Follow/unfollow functionality
- `telegraph`: Integration with Telegraph API
- `reactions`: Emoji reactions to posts

Example procedure:
```tsx
// server/routers.ts
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  posts: router({
    create: publicProcedure
      .input(
        z.object({
          telegramId: z.number(),           // User's Telegram ID
          content: z.string().min(1).max(165), // Post content (max 165 chars)
          imageBase64: z.string().optional(),   // Optional image as base64
          telegraphUrl: z.string().optional(),  // Optional Telegraph link
        })
      )
      .mutation(async ({ input }) => {
        // Create post in database
        const postId = await db.createPost({
          telegramId: input.telegramId,
          content: input.content,
          imagePath: imagePath,
          telegraphUrl: input.telegraphUrl,
        });

        return { postId, imagePath };
      }),
  }),
});
```

---

## Storage

File uploads (images) are handled through the storage helpers in `server/storage.ts`. The system is configured to work with S3-compatible storage services.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `TELEGRAPH_TOKEN` | Token for Telegraph API integration |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket name (ex: posts) |

Expo runtime variables (prefixed with `EXPO_PUBLIC_`):

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_BASE_URL` | Your deployed backend API server URL |

---

## Testing

Write tests in `tests/` using Vitest and run them with `pnpm test`.