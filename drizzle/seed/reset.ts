import { drizzle } from "drizzle-orm/libsql";
import { reset } from "drizzle-seed";
import { d1Url } from "../../drizzle.config";
import * as schema from "../schema";

const db = drizzle(`file:${d1Url}`);

async function main() {
	console.log("🔄 Starting to reset data...");

	await reset(db, schema);

	console.log("✅ Reset data successfully!");
}

main().catch((error: unknown) => {
	const message = `❌ Failed to reset data: ${error instanceof Error ? error.message : error}`;
	console.error(message);
	process.exit(1);
});
