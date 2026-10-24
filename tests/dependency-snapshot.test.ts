import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	createDependencySnapshot,
	type SnapshotContext,
} from "../scripts/dependency-snapshot";

const context: SnapshotContext = {
	repository: "foxlau/react-router-v7-better-auth",
	sha: "a".repeat(40),
	ref: "refs/heads/main",
	runId: "123",
	scanned: "2026-10-24T00:00:00.000Z",
};

function fixture(version = 3) {
	return {
		lockfileVersion: version,
		workspaces: {
			"": {
				dependencies: { "@scope/ui": "^1.0.0", alias: "npm:real@2.0.0" },
				devDependencies: { vite: "8.3.5" },
			},
		},
		packages: {
			"@scope/ui": ["@scope/ui@1.0.1", "", {}],
			alias: ["real@2.0.0", "", {}],
			vite: ["vite@8.3.5", "", {}],
			undici: ["undici@7.30.1", "", {}],
			"nested/undici": ["undici@7.30.2", "", {}],
		},
	};
}

describe("Bun dependency graph snapshots", () => {
	test("submits scoped packages, aliases and every nested resolved version", () => {
		const snapshot = createDependencySnapshot(
			JSON.stringify(fixture()),
			context,
		);
		const packages = snapshot.manifests["bun.lock"].resolved;
		expect(Object.keys(packages)).toHaveLength(5);
		expect(packages["@scope/ui"]).toEqual({
			package_url: "pkg:npm/%40scope/ui@1.0.1",
			relationship: "direct",
			scope: "runtime",
		});
		expect(packages.alias.package_url).toBe("pkg:npm/real@2.0.0");
		expect(packages.vite.scope).toBe("development");
		expect(packages.undici.relationship).toBe("indirect");
		expect(packages.undici.scope).toBeUndefined();
		expect(packages["nested/undici"].package_url).toBe("pkg:npm/undici@7.30.2");
	});

	test("replaces stale package.json data and explicitly retires the deleted pnpm graph", () => {
		const { manifests } = createDependencySnapshot(
			JSON.stringify(fixture()),
			context,
		);
		expect(Object.keys(manifests["package.json"].resolved)).toHaveLength(3);
		expect(manifests["package.json"].resolved.vite.package_url).toBe(
			"pkg:npm/vite@8.3.5",
		);
		expect(manifests["pnpm-lock.yaml"].resolved).toEqual({});
		expect(manifests["pnpm-lock.yaml"].metadata?.removed).toBe(true);
	});

	test("supports JSONC lockfile versions 1 and 3", () => {
		for (const version of [1, 3]) {
			const text = `// Bun lockfile\n${JSON.stringify(fixture(version)).replace(/}$/, ",}")}`;
			expect(createDependencySnapshot(text, context).sha).toBe(context.sha);
		}
	});

	test("fails closed for unknown formats and empty inventories", () => {
		expect(() =>
			createDependencySnapshot(JSON.stringify(fixture(99)), context),
		).toThrow("Unsupported Bun lockfile version");
		expect(() =>
			createDependencySnapshot(
				JSON.stringify({ ...fixture(), packages: {} }),
				context,
			),
		).toThrow("empty dependency inventory");
		expect(() => createDependencySnapshot("[]", context)).toThrow(
			"expected an object",
		);
	});

	test("rejects missing direct dependencies and unsupported sources instead of hiding them", () => {
		const missing = fixture();
		Reflect.deleteProperty(missing.packages, "vite");
		expect(() =>
			createDependencySnapshot(JSON.stringify(missing), context),
		).toThrow("Missing direct dependency: vite");
		const unsupported = fixture();
		unsupported.packages.undici[0] = "github:owner/undici";
		expect(() =>
			createDependencySnapshot(JSON.stringify(unsupported), context),
		).toThrow("Unsupported non-registry package");
	});

	test("never labels a PR or an invalid SHA as the main dependency graph", () => {
		for (const change of [
			{ ref: "refs/pull/198/merge" },
			{ sha: "invalid" },
			{ sha: "a".repeat(41) },
			{ repository: "../../other-repo" },
		]) {
			expect(() =>
				createDependencySnapshot(JSON.stringify(fixture()), {
					...context,
					...change,
				}),
			).toThrow();
		}
	});

	test("the publisher refuses to retire a pnpm lockfile that actually exists", () => {
		const directory = mkdtempSync(join(tmpdir(), "dependency-publisher-"));
		try {
			writeFileSync(join(directory, "pnpm-lock.yaml"), "lockfileVersion: 9\n");
			const result = Bun.spawnSync(
				[
					process.execPath,
					fileURLToPath(
						new URL("../scripts/submit-dependencies.ts", import.meta.url),
					),
				],
				{ cwd: directory },
			);
			expect(result.exitCode).not.toBe(0);
			expect(result.stderr.toString()).toContain(
				"refusing to replace its dependency graph",
			);
		} finally {
			rmSync(directory, { recursive: true, force: true });
		}
	});

	test("the actual repository lockfile produces a complete inventory", async () => {
		const text = await Bun.file("bun.lock").text();
		const lock = Bun.JSONC.parse(text);
		if (
			typeof lock !== "object" ||
			lock === null ||
			!("packages" in lock) ||
			typeof lock.packages !== "object" ||
			lock.packages === null
		) {
			throw new Error("Invalid test lockfile");
		}
		const snapshot = createDependencySnapshot(text, context);
		expect(Object.keys(snapshot.manifests["bun.lock"].resolved)).toHaveLength(
			Object.keys(lock.packages).length,
		);
		expect(snapshot.manifests["package.json"].resolved.vite.package_url).toBe(
			"pkg:npm/vite@8.3.5",
		);
	});
});
