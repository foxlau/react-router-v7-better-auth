import { env } from "cloudflare:workers";

export const deleteUserImageFromR2 = async (imageUrl: string | null) => {
	if (!imageUrl) return;

	const isExternalUrl =
		imageUrl.startsWith("http://") || imageUrl.startsWith("https://");

	if (!isExternalUrl) {
		let r2ObjectKey = imageUrl;
		const queryParamIndex = r2ObjectKey.indexOf("?"); // remove query params
		if (queryParamIndex !== -1) {
			r2ObjectKey = r2ObjectKey.substring(0, queryParamIndex);
		}
		if (r2ObjectKey) {
			await env.R2.delete(r2ObjectKey);
		}
	}
};
