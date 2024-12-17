import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Better auth tables
// Added indexes based on the table provided by Better auth
// https://www.better-auth.com/docs/concepts/database
export const user = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
    image: text("image"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  },
  (table) => {
    return {
      emailIndex: index("user_email_idx").on(table.email),
    };
  },
);

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  },
  (table) => {
    return {
      userIdIndex: index("session_userId_idx").on(table.userId),
      tokenIndex: index("session_token_idx").on(table.token),
    };
  },
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: integer("accessTokenExpiresAt", {
      mode: "timestamp",
    }),
    refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
      mode: "timestamp",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  },
  (table) => {
    return {
      userIdIndex: index("account_userId_idx").on(table.userId),
      providerIdAccountIdIndex: index("account_providerId_accountId_idx").on(
        table.providerId,
        table.accountId,
      ),
    };
  },
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }),
    updatedAt: integer("updatedAt", { mode: "timestamp" }),
  },
  (table) => {
    return {
      identifierIndex: index("verification_identifier_idx").on(
        table.identifier,
      ),
    };
  },
);

export const rateLimit = sqliteTable(
  "rateLimit",
  {
    id: text("id").primaryKey(),
    key: text("key"),
    count: integer("count"),
    lastRequest: integer("lastRequest"),
  },
  (table) => {
    return {
      keyIndex: index("rateLimit_key_idx").on(table.key),
    };
  },
);

// Todo tables
export const todo = sqliteTable(
  "todo",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    completed: integer("completed").notNull().default(0),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => {
    return {
      userIdIndex: index("todo_userId_idx").on(table.userId),
    };
  },
);
