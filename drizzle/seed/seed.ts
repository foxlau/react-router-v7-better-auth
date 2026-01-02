import { drizzle } from "drizzle-orm/libsql";
import { seed } from "drizzle-seed";
import { d1Url } from "../../drizzle.config";
import { accounts, users } from "../schema/auth";

const db = drizzle(`file:${d1Url}`);

async function main() {
	console.log("🌱 Starting to seed data into database...");

	console.log("⌛️ Seeding auth data...");
	await seed(db, { users, accounts }).refine((f) => ({
		users: {
			count: 1,
			columns: {
				id: f.default({
					defaultValue: "F9CgW4v5USKvUNTIGBiafa6xrgDjaOhS",
				}),
				name: f.default({ defaultValue: "Andy Smith" }),
				username: f.default({ defaultValue: "andy" }),
				displayUsername: f.default({ defaultValue: "Andy S" }),
				email: f.default({ defaultValue: "admin@example.com" }),
				emailVerified: f.default({ defaultValue: true }),
				role: f.default({ defaultValue: "admin" }),
				image: f.default({ defaultValue: null }),
				banned: f.default({ defaultValue: false }),
				banReason: f.default({ defaultValue: null }),
				banExpires: f.default({ defaultValue: null }),
			},
		},
		accounts: {
			count: 1,
			columns: {
				id: f.default({
					defaultValue: "W8Oa8UCI6sKswFaF8uzIKkmRfP3HRIaD",
				}),
				accountId: f.default({
					defaultValue: "account_F9CgW4v5USKvUNTIGBiafa6xrgDjaOhS",
				}),
				providerId: f.default({ defaultValue: "credential" }),
				password: f.default({
					defaultValue:
						"b47e2466463c1b19d5a58f3e15775889:3f35be608e65080399c90ebe4731176a5c91d976da03ad08b22d065e56f1f1db5eea6e3ef71451f7bc6b58398e3ffa03acc3ca193d5997a4881897503c29a4a5",
				}),
				accessToken: f.default({ defaultValue: null }),
				accessTokenExpiresAt: f.default({ defaultValue: null }),
				refreshToken: f.default({ defaultValue: null }),
				refreshTokenExpiresAt: f.default({ defaultValue: null }),
				idToken: f.default({ defaultValue: null }),
				scope: f.default({ defaultValue: null }),
			},
		},
	}));

	console.log("✅ Seeded data successfully!");
}

main().catch((error: unknown) => {
	const message = `❌ Failed to seed data: ${error instanceof Error ? error.message : error}`;
	console.error(message);
	process.exit(1);
});
