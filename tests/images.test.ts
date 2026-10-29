import { beforeEach, describe, expect, mock, test } from "bun:test";
import { createStaticHandler } from "react-router";

const get =
	mock<
		(key: string) => Promise<{
			httpMetadata?: { contentType?: string };
			blob: () => Promise<Blob>;
		} | null>
	>();
mock.module("cloudflare:workers", () => ({ env: { R2: { get } } }));

const { loader } = await import("../app/routes/images");
const handler = createStaticHandler([
	{
		path: "images/*",
		loader: (args) => {
			const key = args.params["*"];
			if (key === undefined) throw new Error("Missing image key");
			return loader({ ...args, params: { "*": key } });
		},
	},
]);

beforeEach(() => get.mockReset());

describe("R2 image responses", () => {
	test.each([undefined, {}, { contentType: undefined }])(
		"uses application/octet-stream when stored content type is missing: %j",
		async (httpMetadata) => {
			get.mockResolvedValue({
				httpMetadata,
				blob: async () => new Blob(["binary data"]),
			});
			const response = await handler.queryRoute(
				new Request("http://localhost/images/user-avatar/test.png"),
			);
			expect(response.status).toBe(200);
			expect(response.headers.get("Content-Type")).toBe(
				"application/octet-stream",
			);
			expect(await response.text()).toBe("binary data");
			expect(get).toHaveBeenCalledWith("user-avatar/test.png");
		},
	);

	test("preserves the stored content type", async () => {
		get.mockResolvedValue({
			httpMetadata: { contentType: "image/png" },
			blob: async () => new Blob(["image bytes"]),
		});
		const response = await handler.queryRoute(
			new Request("http://localhost/images/avatar.png"),
		);
		expect(response.headers.get("Content-Type")).toBe("image/png");
		expect(await response.text()).toBe("image bytes");
	});

	test("missing objects still return an empty 404", async () => {
		get.mockResolvedValue(null);
		const response = await handler.queryRoute(
			new Request("http://localhost/images/missing.png"),
		);
		expect(response.status).toBe(404);
		expect(await response.text()).toBe("");
	});
});
