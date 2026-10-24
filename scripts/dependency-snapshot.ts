type Dependency = {
	package_url: string;
	relationship: "direct" | "indirect";
	scope?: "runtime" | "development";
};

type Manifest = {
	name: string;
	file: { source_location: string };
	resolved: Record<string, Dependency>;
	metadata?: Record<string, string | boolean>;
};

export type SnapshotContext = {
	repository: string;
	sha: string;
	ref: string;
	runId: string;
	scanned: string;
};

function record(value: unknown, label: string): Record<string, unknown> {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		throw new Error(`Invalid ${label}: expected an object`);
	}
	return value as Record<string, unknown>;
}

function names(value: unknown): string[] {
	return value === undefined ? [] : Object.keys(record(value, "dependencies"));
}

function packageURL(specifier: string): string {
	const match =
		/^(@[^\s/@]+\/[^\s/@]+|[^\s/@]+)@(\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?)$/.exec(
			specifier,
		);
	if (!match) throw new Error(`Unsupported non-registry package: ${specifier}`);
	const name = encodeURIComponent(match[1]).replaceAll("%2F", "/");
	return `pkg:npm/${name}@${encodeURIComponent(match[2])}`;
}

export function createDependencySnapshot(
	text: string,
	context: SnapshotContext,
) {
	if (!/^[\w.-]+\/[\w.-]+$/.test(context.repository)) {
		throw new Error("Invalid GitHub repository");
	}
	if (
		!/^(?:[a-f\d]{40}|[a-f\d]{64})$/.test(context.sha) ||
		context.ref !== "refs/heads/main"
	) {
		throw new Error("Dependency snapshots must identify a main-branch commit");
	}

	const lock = record(Bun.JSONC.parse(text), "Bun lockfile");
	if (lock.lockfileVersion !== 1 && lock.lockfileVersion !== 3) {
		throw new Error(
			`Unsupported Bun lockfile version: ${lock.lockfileVersion}`,
		);
	}
	const root = record(
		record(lock.workspaces, "workspaces")[""],
		"root workspace",
	);
	const runtime = new Set([
		...names(root.dependencies),
		...names(root.optionalDependencies),
		...names(root.peerDependencies),
	]);
	const development = new Set(names(root.devDependencies));
	const entries = Object.entries(record(lock.packages, "packages"));
	if (entries.length === 0)
		throw new Error("Refusing to submit an empty dependency inventory");

	const resolved = Object.fromEntries(
		entries.map(([key, entry]): [string, Dependency] => {
			if (!Array.isArray(entry) || typeof entry[0] !== "string") {
				throw new Error(`Invalid locked package: ${key}`);
			}
			const dependency: Dependency = {
				package_url: packageURL(entry[0]),
				relationship:
					runtime.has(key) || development.has(key) ? "direct" : "indirect",
			};
			if (runtime.has(key)) dependency.scope = "runtime";
			else if (development.has(key)) dependency.scope = "development";
			// Transitive scope is intentionally unspecified, not guessed from hoisting.
			return [key, dependency];
		}),
	);

	for (const name of [
		...names(root.dependencies),
		...names(root.devDependencies),
	]) {
		if (!Object.hasOwn(resolved, name))
			throw new Error(`Missing direct dependency: ${name}`);
	}

	const manifests: Record<string, Manifest> = {
		"bun.lock": {
			name: "bun.lock",
			file: { source_location: "bun.lock" },
			resolved,
		},
		"package.json": {
			name: "package.json",
			file: { source_location: "package.json" },
			resolved: Object.fromEntries(
				Object.entries(resolved).filter(
					([, value]) => value.relationship === "direct",
				),
			),
		},
		// User submissions supersede GitHub's stale static graph for this deleted file.
		// The submitting script refuses to publish if this legacy lockfile exists.
		"pnpm-lock.yaml": {
			name: "pnpm-lock.yaml",
			file: { source_location: "pnpm-lock.yaml" },
			metadata: { removed: true, superseded_by: "bun.lock" },
			resolved: {},
		},
	};

	return {
		version: 0,
		sha: context.sha,
		ref: context.ref,
		scanned: context.scanned,
		job: {
			id: context.runId,
			correlator: "bun-dependency-submission",
			html_url: `https://github.com/${context.repository}/actions/runs/${context.runId}`,
		},
		detector: {
			name: "bun-lock-snapshot",
			version: "1.0.0",
			url: `https://github.com/${context.repository}/blob/main/scripts/dependency-snapshot.ts`,
		},
		manifests,
	};
}
