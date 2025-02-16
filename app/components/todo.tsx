import { CheckIcon, XIcon } from "lucide-react";
import { useFetcher } from "react-router";

import { useState } from "react";
import { useDoubleCheck } from "~/hooks/use-double-check";
import { cn } from "~/lib/utils";
import type { loader } from "~/routes/todos";
import { Spinner } from "./spinner";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

export function ToggleTodo({
  todo,
}: {
  todo: Awaited<ReturnType<typeof loader>>["todos"][number];
}) {
  const [checked, setChecked] = useState(todo.completed === 1);
  const fetcher = useFetcher();

  return (
    <Label className="flex items-center gap-2">
      <Checkbox
        name="completed"
        className="rounded"
        checked={checked}
        onClick={() => {
          setChecked((prevIsChecked) => prevIsChecked !== true);
          const formData = new FormData();
          formData.append("todoId", todo.id.toString());
          formData.append("intent", "complete");
          fetcher.submit(formData, {
            method: "POST",
          });
        }}
      />
      <span
        className={cn("font-medium", {
          "text-muted-foreground line-through": checked,
        })}
      >
        {todo.title}
      </span>
    </Label>
  );
}

export function DeleteTodo({ todoId }: { todoId: number }) {
  const { doubleCheck, getButtonProps } = useDoubleCheck();
  const fetcher = useFetcher();
  const isDeleting = fetcher.state !== "idle";

  return (
    <>
      <fetcher.Form method="post">
        <input type="hidden" name="todoId" value={todoId} />
        <Button
          type="submit"
          name="intent"
          value="delete"
          variant="destructive"
          size="icon"
          className={cn(
            "bg-destructive/15 text-destructive/80 size-6 hover:text-white",
            { "bg-destructive text-white": doubleCheck },
          )}
          disabled={isDeleting}
          {...getButtonProps()}
        >
          {doubleCheck ? isDeleting ? <Spinner /> : <CheckIcon /> : <XIcon />}
        </Button>
      </fetcher.Form>
    </>
  );
}
