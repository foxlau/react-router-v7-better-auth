import { count } from "drizzle-orm";
import { FileStackIcon, FoldersIcon, TagsIcon, UsersIcon } from "lucide-react";
import { Suspense } from "react";
import { Await, data, href } from "react-router";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useAuthAdmin } from "~/hooks/use-auth-user";
import { db } from "~/lib/database/db.server";
import { user } from "~/lib/database/schema";
import type { Route } from "./+types/dashboard";

export const meta: Route.MetaFunction = () => [{ title: "Dashboard" }];

export const handle = {
  breadcrumb: () => ({ label: "Dashboard", to: href("/admin") }),
};

export async function loader(_: Route.LoaderArgs) {
  const usersCountPromise = db
    .select({ count: count(user.id) })
    .from(user)
    .get()
    .then((result) => result?.count ?? 0);

  // TODO: replace with actual data
  const totalContentPromise = new Promise<number>((resolve) =>
    setTimeout(() => resolve(100), 30),
  );
  const categoriesCountPromise = new Promise<number>((resolve) =>
    setTimeout(() => resolve(392), 60),
  );
  const tagsCountPromise = new Promise<number>((resolve) =>
    setTimeout(() => resolve(678), 90),
  );

  return data({
    usersCountPromise,
    totalContentPromise,
    categoriesCountPromise,
    tagsCountPromise,
  });
}

export default function AdminIndexRoute({
  loaderData: {
    usersCountPromise,
    totalContentPromise,
    categoriesCountPromise,
    tagsCountPromise,
  },
}: Route.ComponentProps) {
  const { user } = useAuthAdmin();

  return (
    <div className="space-y-4">
      <h1 className="font-semibold text-xl">👋 Hi, {user.name}</h1>
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-4">
        <Suspense fallback={<CardSkeleton />}>
          <Await
            resolve={usersCountPromise}
            errorElement={<div>Failed to load users count.</div>}
          >
            {(usersCount) => (
              <Card className="@container/card dark:bg-accent/30">
                <CardHeader>
                  <CardDescription>Users</CardDescription>
                  <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
                    {usersCount}
                  </CardTitle>
                  <CardAction>
                    <UsersIcon className="size-4 text-muted-foreground" />
                  </CardAction>
                </CardHeader>
              </Card>
            )}
          </Await>
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <Await
            resolve={totalContentPromise}
            errorElement={<div>Failed to load total content.</div>}
          >
            {(totalContent) => (
              <Card className="@container/card dark:bg-accent/30">
                <CardHeader>
                  <CardDescription>Total Content</CardDescription>
                  <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
                    {totalContent}
                  </CardTitle>
                  <CardAction>
                    <FileStackIcon className="size-4 text-muted-foreground" />
                  </CardAction>
                </CardHeader>
              </Card>
            )}
          </Await>
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <Await
            resolve={categoriesCountPromise}
            errorElement={<div>Failed to load categories count.</div>}
          >
            {(categoriesCount) => (
              <Card className="@container/card dark:bg-accent/30">
                <CardHeader>
                  <CardDescription>Categories</CardDescription>
                  <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
                    {categoriesCount}
                  </CardTitle>
                  <CardAction>
                    <FoldersIcon className="size-4 text-muted-foreground" />
                  </CardAction>
                </CardHeader>
              </Card>
            )}
          </Await>
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <Await
            resolve={tagsCountPromise}
            errorElement={<div>Failed to load tags count.</div>}
          >
            {(tagsCount) => (
              <Card className="@container/card dark:bg-accent/30">
                <CardHeader>
                  <CardDescription>Tags</CardDescription>
                  <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
                    {tagsCount}
                  </CardTitle>
                  <CardAction>
                    <TagsIcon className="size-4 text-muted-foreground" />
                  </CardAction>
                </CardHeader>
              </Card>
            )}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>
          <Skeleton className="h-4 w-8/12" />
        </CardDescription>
        <CardTitle className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-5/12" />
          <Skeleton className="h-4 w-9/12" />
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
