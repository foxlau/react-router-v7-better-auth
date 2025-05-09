import { ArrowRightIcon } from "lucide-react";
import { Link, href } from "react-router";

import { AppLogo } from "~/components/app-logo";
import { ColorSchemeToggle } from "~/components/color-scheme-toggle";
import { GithubIcon } from "~/components/icons";
import { Button, buttonVariants } from "~/components/ui/button";
import { AppInfo } from "~/lib/config";
import { cn } from "~/lib/utils";
import type { Route } from "./+types";

export const meta: Route.MetaFunction = () => {
  return [{ title: AppInfo.name }];
};

export default function HomeRoute() {
  return (
    <div className="relative flex h-dvh w-full flex-col bg-background">
      <div className="absolute top-4 right-4 sm:right-10">
        <ColorSchemeToggle />
      </div>
      <main className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-6 sm:px-10">
        <section className="flex flex-col items-center gap-4">
          <AppLogo />

          <div className="font-extrabold text-4xl text-primary leading-8 tracking-tight sm:text-5xl sm:leading-10">
            React Router v7 <br /> with Better auth.
          </div>

          <p className="text-center font-normal text-base opacity-80">
            {AppInfo.description}
          </p>

          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link
                to="https://github.com/foxlau/react-router-v7-better-auth"
                reloadDocument
              >
                <GithubIcon />
                Star on Github
              </Link>
            </Button>
            <Link
              to={href("/auth/sign-in")}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Get Started <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
