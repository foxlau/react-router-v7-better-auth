import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
	...defaultStatements,
	dashboard: ["read"],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
	dashboard: ["read"],
	...adminAc.statements,
});

export const editor = ac.newRole({
	dashboard: ["read"],
});
