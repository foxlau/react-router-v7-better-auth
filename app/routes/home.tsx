import { ArrowRightIcon, XIcon } from "lucide-react";
import { Link } from "react-router";

import {
  BetterAuthIcon,
  GithubIcon,
  ReactRouterIcon,
} from "~/components/icons";
import { ThemeSelector } from "~/components/theme-selector";
import { Button } from "~/components/ui/button";

export const meta = () => [{ title: "React Router(v7) x Better Auth" }];

export default function Home() {
  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-background">
      <div className="absolute right-4 top-4 sm:right-6">
        <ThemeSelector />
      </div>
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center overflow-hidden px-8">
        <section className="z-20 flex flex-col items-center justify-center gap-[18px] sm:gap-6">
          <div className="flex items-center gap-4">
            <ReactRouterIcon theme="light" className="block w-10 dark:hidden" />
            <ReactRouterIcon theme="dark" className="hidden w-10 dark:block" />
            <XIcon className="size-4 text-muted-foreground" />
            <BetterAuthIcon className="size-8" />
          </div>
          <div className="text-center text-[clamp(40px,10vw,44px)] font-bold leading-[1.2] tracking-tighter sm:text-[60px]">
            <div className="leading-10 text-primary sm:leading-[3.5rem]">
              React Router v7 <br /> with Better auth.
            </div>
          </div>
          <p className="text-center text-base font-normal sm:w-[466px] sm:text-[18px] sm:leading-7">
            This is a template that can be deployed on Cloudflare Workers, built
            with React Router v7 (Remix), Better Auth, Drizzle ORM, and D1.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="outline" className="rounded-full" asChild>
              <Link
                to="https://github.com/foxlau/react-router-v7-better-auth"
                reloadDocument
              >
                <GithubIcon />
                Star us on Github
              </Link>
            </Button>
            <Button className="rounded-full" asChild>
              <Link to="/auth/sign-in">
                Get Started <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
