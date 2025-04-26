import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { and, eq, sql } from "drizzle-orm";
import { PlusIcon } from "lucide-react";
import { Form, data } from "react-router";

import { Spinner } from "~/components/spinner";
import { DeleteTodo, ToggleTodo } from "~/components/todo";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useIsPending } from "~/hooks/use-is-pending";
import { authSessionContext } from "~/lib/contexts";
import { db } from "~/lib/database/db.server";
import { todo } from "~/lib/database/schema";
import { todoActionSchema } from "~/lib/validations/todo";
import type { Route } from "./+types/todos";

export const meta: Route.MetaFunction = () => [{ title: "Todos" }];

export async function loader({ context }: Route.LoaderArgs) {
  const authSession = context.get(authSessionContext);
  const todos = await db.query.todo.findMany({
    where: (todo, { eq }) => eq(todo.userId, authSession.user.id),
  });
  return { todos };
}

export async function action({ request, context }: Route.ActionArgs) {
  const authSession = context.get(authSessionContext);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: todoActionSchema });

  if (submission.status !== "success") {
    return data(submission.reply(), { status: 400 });
  }

  switch (submission.value.intent) {
    case "add":
      await db
        .insert(todo)
        .values({ title: submission.value.title, userId: authSession.user.id });
      break;
    case "delete":
      await db.delete(todo).where(eq(todo.id, submission.value.todoId));
      break;
    case "complete":
      await db
        .update(todo)
        .set({
          completed: sql`CASE WHEN completed = 0 THEN 1 ELSE 0 END`,
        })
        .where(and(eq(todo.id, submission.value.todoId)));
      break;
  }

  return submission.reply({ resetForm: true });
}

export default function Todos({
  loaderData: { todos },
  actionData,
}: Route.ComponentProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: todoActionSchema });
    },
    constraint: getZodConstraint(todoActionSchema),
    lastResult: actionData,
    shouldRevalidate: "onInput",
  });

  const isAdding = useIsPending({
    formAction: "/todos",
    formMethod: "POST",
  });

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
        <Form method="post" className="space-y-2" {...getFormProps(form)}>
          <div className="flex gap-2">
            <Input
              placeholder="Add a todo"
              {...getInputProps(fields.title, { type: "text" })}
            />
            <input type="hidden" name="intent" value="add" />
            <Button type="submit" disabled={isAdding}>
              Add
              {isAdding ? <Spinner /> : <PlusIcon />}
            </Button>
          </div>
          {fields.title.errors && (
            <p
              className="text-destructive text-xs"
              role="alert"
              aria-live="polite"
            >
              {fields.title.errors.join(", ")}
            </p>
          )}
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
