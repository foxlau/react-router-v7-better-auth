import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { getSessionContext } from "session-context";
import * as schema from "./schema";

export const getDatabaseFromContext = () => {
  const store = getSessionContext<{
    db?: DrizzleD1Database<typeof schema>;
    env: Env;
  }>();
  if (!store.db) {
    store.db = drizzle(store.env.DB, { schema });
  }

  return store.db;
};

export const db = new Proxy<DrizzleD1Database<typeof schema>>({} as never, {
  get(_target: unknown, props: keyof DrizzleD1Database<typeof schema>) {
    const instance = getDatabaseFromContext();
    const value = instance[props];

    if (typeof value === "function") {
      return value.bind(instance);
    }

    return value;
  },
});
