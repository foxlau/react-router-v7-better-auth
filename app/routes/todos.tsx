import { and, eq } from "drizzle-orm";
import { PlusIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { Form, redirect, useNavigation } from "react-router";

import { Spinner } from "~/components/spinner";
import { DeleteTodo, ToggleTodo } from "~/components/todo";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useIsPending } from "~/hooks/use-is-pending";
import { serverAuth } from "~/lib/auth/auth.server";
import { db } from "~/lib/database/db.server";
import { todo } from "~/lib/database/schema";
import type { Route } from "./+types/todos";

export const meta: Route.MetaFunction = () => [{ title: "Todos" }];

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await serverAuth().api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: request.headers,
  });

  if (!auth) {
    throw redirect("/auth/sign-in");
  }

  const todos = await db.query.todo.findMany({
    where: (todo, { eq }) => eq(todo.userId, auth.user.id),
  });

  return { todos };
}

export async function action({ request }: Route.ActionArgs) {
  const auth = await serverAuth().api.getSession({
    query: {
      disableCookieCache: true,
    },
    headers: request.headers,
  });

  if (!auth) {
    throw redirect("/auth/sign-in");
  }

  const formData = await request.clone().formData();
  const intent = formData.get("intent") as string;
  const title = formData.get("title") as string;
  const todoId = formData.get("todoId") as string;
  const id = Number.parseInt(todoId);

  // Note that this is a crude implementation.
  switch (intent) {
    case "add":
      if (title.length) {
        await db.insert(todo).values({ title, userId: auth.user.id });
      }
      break;
    case "delete":
      if (id) {
        await db.delete(todo).where(eq(todo.id, id));
      }
      break;
    case "complete":
      if (id) {
        const _todo = await db.query.todo.findFirst({
          where: and(eq(todo.id, id), eq(todo.userId, auth.user.id)),
          columns: { id: true, completed: true },
        });
        if (_todo) {
          await db
            .update(todo)
            .set({ completed: _todo.completed ? 0 : 1 })
            .where(and(eq(todo.id, id), eq(todo.userId, auth.user.id)));
        }
      }
      break;
  }

  return null;
}

export default function Todos({
  loaderData: { todos },
  actionData,
}: Route.ComponentProps) {
  const form = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();
  const isAdding = useIsPending({
    formAction: "/todos",
    formMethod: "POST",
  });

  useEffect(() => {
    if (navigation.state === "idle" && actionData === null) {
      form.current?.reset();
    }
  }, [navigation.state, actionData]);

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="font-semibold text-base capitalize">Todo List</h1>
        <p className="text-foreground/70">
          This is a practical case demonstrating the combined use of Cloudflare
          D1 and Drizzle ORM.
        </p>
      </section>

      <section className="space-y-4">
        <Form ref={form} method="post" className="flex items-center gap-2">
          <Input
            type="text"
            name="title"
            placeholder="Drift off into a reverie"
            required
          />
          <Button type="submit" name="intent" value="add" disabled={isAdding}>
            Add
            {isAdding ? <Spinner /> : <PlusIcon />}
          </Button>
        </Form>

        {todos?.length > 0 && (
          <div className="divide-y">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <ToggleTodo todo={todo} />
                <DeleteTodo todoId={todo.id} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
