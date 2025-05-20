import { parseWithZod } from "@conform-to/zod";
import { data, redirect } from "react-router";
import { localeCookie } from "~/lib/i18n/detector";
import { LocaleSchema } from "~/lib/i18n/schema";
import type { Route } from "./+types/color-scheme";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.clone().formData();
  const submission = parseWithZod(formData, { schema: LocaleSchema });

  if (submission.status !== "success") {
    throw data("Invalid locale scheme", { status: 400 });
  }

  const { locale, returnTo } = submission.value;

  // use session
  // const session = await localeSession.getSession(request.headers.get("Cookie"));
  // session.set("lng", locale);
  // return redirect(returnTo || "/", {
  //   headers: { "Set-Cookie": await localeSession.commitSession(session) },
  // });
  // use cookie
  return redirect(returnTo || "/", {
    headers: { "Set-Cookie": await localeCookie.serialize(locale) },
  });
}
