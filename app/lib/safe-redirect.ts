const DEFAULT_REDIRECT = "/";

/**
 * 安全重定向路径
 * - 支持表单值、字符串
 * - 自动去除空格
 * - 拒绝完整 URL
 * - 拒绝包含 .. 或 \ 的路径
 * @param to 用户提供的重定向路径
 * @param defaultRedirect 默认路径
 */
export function safeRedirectPath(
	to: FormDataEntryValue | string | null | undefined,
	defaultRedirect: string = DEFAULT_REDIRECT,
): string {
	if (!to || typeof to !== "string") return defaultRedirect;

	const trimmedTo = to.trim();

	// 基本检查
	if (
		!trimmedTo.startsWith("/") || // 必须以 / 开头
		trimmedTo.startsWith("//") || // 禁止 //
		trimmedTo.startsWith("/\\") || // 禁止 /\
		trimmedTo.includes("..") // 禁止相对路径穿越
	) {
		return defaultRedirect;
	}

	// 尝试解析为完整 URL，禁止跳转到外部域
	try {
		new URL(trimmedTo);
		// 如果没有抛异常，说明是完整 URL，直接返回默认
		return defaultRedirect;
	} catch {
		// 如果解析失败，则是相对路径，继续验证
	}

	// 解析为相对路径确保安全
	try {
		const url = new URL(trimmedTo, "https://example.com");
		if (url.hostname !== "example.com") return defaultRedirect;
	} catch {
		return defaultRedirect;
	}

	return trimmedTo;
}
