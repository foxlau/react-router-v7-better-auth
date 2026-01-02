import { data, redirect } from "react-router";
import { ThemeSchema } from "~/lib/client-hints";
import { safeRedirectPath } from "~/lib/safe-redirect";
import { setTheme } from "~/services/theme.server";
import type { Route } from "./+types/theme-switcher";

export async function action({ request }: Route.ActionArgs) {
	const formData = Object.fromEntries(await request.formData());
	const result = ThemeSchema.safeParse(formData);

	if (!result.success) {
		return data({ error: result.error.flatten().fieldErrors }, { status: 400 });
	}

	const { theme, redirectTo } = result.data;

	const responseInit = {
		headers: { "Set-Cookie": setTheme(theme) },
	};

	if (redirectTo) {
		return redirect(safeRedirectPath(redirectTo), responseInit);
	}

	return data({ result: "success" }, responseInit);
}
