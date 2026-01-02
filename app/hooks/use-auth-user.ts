import { unstable_useRoute as useRoute } from "react-router";

export function useAuthUser() {
	const data = useRoute("root");

	if (!data?.loaderData?.user) {
		throw new Error(
			"Authentication data not available. Make sure you're using this hook within the root route.",
		);
	}

	return data.loaderData.user;
}

export function useOptionalAuthUser() {
	const data = useRoute("root");
	return data?.loaderData?.user;
}
