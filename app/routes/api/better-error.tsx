import { ArrowLeftIcon, ShieldAlert } from "lucide-react";
import {
	href,
	Link,
	type LoaderFunctionArgs,
	useSearchParams,
} from "react-router";

import { buttonVariants } from "~/components/ui/button";
import { getPageTitle } from "~/lib/utils";
import { auth } from "~/services/auth/auth.server";

export function meta() {
	return [{ title: getPageTitle("Authentication Error") }];
}

export async function loader({ request }: LoaderFunctionArgs) {
	return auth.handler(request);
}

export default function BetterError() {
	const [searchParams] = useSearchParams();
	const error = searchParams.get("error");
	const error_description = searchParams.get("error_description");

	return (
		<div className="container mx-auto flex min-h-screen items-center px-6 py-12">
			<div className="mx-auto flex max-w-sm flex-col items-center text-center">
				<p className="rounded-full bg-muted p-3 font-medium">
					<ShieldAlert className="h-6 w-6" />
				</p>

				<h1 className="mt-2 font-semibold text-xl md:text-2xl">
					Authentication Error
				</h1>

				<p className="mt-2 text-muted-foreground">
					{error_description
						? error_description
						: "We encountered an issue while processing your request. Please try\
						again or contact the application owner if the problem persists."}
				</p>

				<div className="mt-6 flex w-full shrink-0 items-center justify-center space-x-3">
					<Link
						to={href("/auth/sign-in")}
						className={buttonVariants({ variant: "outline" })}
					>
						<ArrowLeftIcon className="size-4" />
						Go to Login
					</Link>
					<Link
						to={href("/")}
						className={buttonVariants({ variant: "outline" })}
					>
						Take me home
					</Link>
				</div>

				<p className="mt-6 text-muted-foreground text-xs underline decoration-1 decoration-muted-foreground/30 decoration-wavy underline-offset-2">
					Error code: {error}
				</p>
			</div>
		</div>
	);
}
