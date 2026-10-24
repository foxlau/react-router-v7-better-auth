import { createDependencySnapshot } from "./dependency-snapshot";

function required(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`Missing environment variable: ${name}`);
	return value;
}

if (await Bun.file("pnpm-lock.yaml").exists()) {
	throw new Error(
		"Legacy pnpm-lock.yaml exists; refusing to replace its dependency graph",
	);
}

const repository = required("GITHUB_REPOSITORY");
const snapshot = createDependencySnapshot(await Bun.file("bun.lock").text(), {
	repository,
	sha: required("GITHUB_SHA"),
	ref: required("GITHUB_REF"),
	runId: required("GITHUB_RUN_ID"),
	scanned: new Date().toISOString(),
});

const response = await fetch(
	`https://api.github.com/repos/${repository}/dependency-graph/snapshots`,
	{
		method: "POST",
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${required("GH_TOKEN")}`,
			"Content-Type": "application/json",
			"X-GitHub-Api-Version": "2026-03-10",
		},
		body: JSON.stringify(snapshot),
	},
);

if (!response.ok) {
	throw new Error(
		`Dependency submission failed (${response.status}): ${(await response.text()).slice(0, 1000)}`,
	);
}

console.log(
	`Submitted ${Object.keys(snapshot.manifests["bun.lock"].resolved).length} locked packages for ${snapshot.sha}`,
);
console.log(await response.json());
