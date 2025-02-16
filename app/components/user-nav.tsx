import { useNavigate, useSubmit } from "react-router";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { loader } from "~/routes/layout";
import { Button } from "./ui/button";

export function UserNav({
  user,
}: {
  user: Awaited<ReturnType<typeof loader>>["authSession"]["user"];
}) {
  const navigate = useNavigate();
  const submit = useSubmit();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 rounded-full">
          <Avatar className="size-8">
            <AvatarImage
              src={
                user?.image
                  ? user?.image
                  : `https://avatar.vercel.sh/${user?.name}`
              }
              alt={user?.name ?? "User avatar"}
            />
            <AvatarFallback className="text-xs font-bold uppercase">
              {user?.name?.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <strong className="font-medium">{user?.name}</strong>
            <p className="text-muted-foreground truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            navigate("/todos");
          }}
        >
          My todo list
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            navigate("/change-password");
          }}
        >
          Change password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={() => {
            setTimeout(() => {
              submit(null, { method: "POST", action: "/auth/sign-out" });
            }, 100);
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
