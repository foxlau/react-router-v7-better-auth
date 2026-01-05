import { auth } from "./auth.server";

export type PermissionPayload = Record<string, string[]>;

/**
 * Check if a user has a permission.
 * @param userId - The ID of the user to check permissions for.
 * @param permission - The permission to check.
 * @param message - The message to display when the user is not authorized.
 */
export async function requirePermission(
	userId: string,
	permission: PermissionPayload,
	message?: string,
) {
	const result = await auth.api.userHasPermission({
		body: { userId, permission },
	});

	if (!result.success) {
		throw new Response(message ?? "You are not authorized to view this page.", {
			status: 403,
		});
	}

	return true;
}

/**
 * Check if a user has a permission.
 *
 * @param userId - The ID of the user to check permissions for.
 * @param permission - The permission to check.
 */
export async function checkPermission(
	userId: string,
	permission: PermissionPayload,
) {
	const result = await auth.api.userHasPermission({
		body: { userId, permission },
	});

	return result.success;
}
