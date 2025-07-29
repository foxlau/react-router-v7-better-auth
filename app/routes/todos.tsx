import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { and, eq, sql } from "drizzle-orm";
import { data, Form, useNavigation } from "react-router";

import { LoadingButton } from "~/components/forms";
import { TodoItem } from "~/components/todos/todo-item";
import { Input } from "~/components/ui/input";
import { AppInfo } from "~/lib/config";
import { authSessionContext } from "~/lib/contexts";
import { db } from "~/lib/database/db.server";
import { type SelectTodo, todo } from "~/lib/database/schema";
import { formatDate } from "~/lib/utils";
import { todoSchema } from "~/lib/validations/todo";
import type { Route } from "./+types/todos";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Todo List - ${AppInfo.name}` }];
};

export async function loader({ context }: Route.LoaderArgs) {
  const { user } = context.get(authSessionContext);
  const todos = await db.query.todo.findMany({
    where: eq(todo.userId, user.id),
    orderBy: (todo, { desc }) => [desc(todo.createdAt)],
  });
  return data({ todos });
}

export async function action({ request, context }: Route.ActionArgs) {
  const authSession = context.get(authSessionContext);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: todoSchema });

  if (submission.status !== "success") {
    return data(submission.reply(), { status: 400 });
  }

  switch (submission.value.intent) {
    case "create":
      await db.insert(todo).values({
        title: submission.value.title,
        userId: authSession.user.id,
      });
      break;
    case "delete":
      await db
        .delete(todo)
        .where(
          and(
            eq(todo.id, Number(submission.value.id)),
            eq(todo.userId, authSession.user.id),
          ),
        );
      break;
    case "toggle":
      await db
        .update(todo)
        .set({
          completed: sql`CASE WHEN completed = 0 THEN 1 ELSE 0 END`,
        })
        .where(
          and(
            eq(todo.id, Number(submission.value.id)),
            eq(todo.userId, authSession.user.id),
          ),
        );
      break;
  }

  return data(submission.reply({ resetForm: true }));
}

export default function TodosRoute({
  loaderData: { todos },
  actionData,
}: Route.ComponentProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: todoSchema });
    },
    lastResult: actionData,
    constraint: getZodConstraint(todoSchema),
    shouldRevalidate: "onInput",
  });

  const navigation = useNavigation();
  const isSubmitting =
    navigation.state !== "idle" &&
    navigation.formData?.get("intent") === "create";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-base">Todo List</h1>
        <div className="font-mono text-muted-foreground text-sm">
          Today is {formatDate(new Date(), "MMMM d, yyyy")}
        </div>
      </div>

      <Form method="POST" className="space-y-2" {...getFormProps(form)}>
        <div className="flex gap-2">
          <Input
            placeholder="Add a todo"
            {...getInputProps(fields.title, { type: "text" })}
          />
          <input
            defaultValue="create"
            {...getInputProps(fields.intent, { type: "hidden" })}
          />
          <LoadingButton
            buttonText="Add"
            loadingText="Adding..."
            isPending={isSubmitting}
          />
        </div>
        {fields.title.errors && (
          <p
            className="mt-2 text-destructive text-xs"
            role="alert"
            aria-live="polite"
          >
            {fields.title.errors.join(", ")}
          </p>
        )}
      </Form>

      {todos.length === 0 ? (
        <p className="text-muted-foreground text-sm">No todos found</p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-lg border shadow-xs">
          {todos.map((todo: SelectTodo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
    </div>
  );
}
