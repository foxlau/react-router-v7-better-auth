import { ErrorPage } from "~/components/error-boundary";
import { getPageTitle } from "~/lib/utils";

export function meta() {
	return [{ title: getPageTitle("Not Found") }];
}

export async function loader() {
	throw new Response("Page not found", { status: 404 });
}

export async function action() {
	throw new Response("Page not found", { status: 404 });
}

export default function NotFound() {
	return <ErrorBoundary />;
}

export function ErrorBoundary() {
	return (
		<ErrorPage
			title="Not Found"
			description="The page you are looking for does not exist."
		/>
	);
}
