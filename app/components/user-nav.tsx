import { useNavigate, useSubmit } from "react-router";

import {
  CircleGaugeIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  UserCogIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useAuthUser } from "~/hooks/use-auth-user";
import { getAvatarUrl } from "~/lib/utils";
import { Button } from "./ui/button";

export function UserNav() {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const submit = useSubmit();
  const { avatarUrl, placeholderUrl } = getAvatarUrl(user.image, user.name);
  const initials = user?.name?.slice(0, 2);
  const alt = user?.name ?? "User avatar";
  const avatar = avatarUrl || placeholderUrl;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 rounded-full">
          <Avatar className="size-8">
            <AvatarImage src={avatar} alt={alt} />
            <AvatarFallback className="font-bold text-xs uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={avatar} alt={alt} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-muted-foreground text-xs">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            navigate("/");
          }}
        >
          <HomeIcon />
          {t("home.title")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            navigate("/dashboard");
          }}
        >
          <LayoutDashboardIcon />
          {t("dashboard.title")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            navigate("/settings/account");
          }}
        >
          <UserCogIcon />
          {t("dashboard.account.label")}
        </DropdownMenuItem>
        {/* Todo: coming soon */}
        <DropdownMenuItem disabled>
          <CircleGaugeIcon />
          {t("dashboard.admin.label")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setTimeout(() => {
              submit(null, { method: "POST", action: "/auth/sign-out" });
            }, 100);
          }}
        >
          <LogOutIcon />
          {t("auth.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
