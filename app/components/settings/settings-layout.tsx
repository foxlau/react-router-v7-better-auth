interface SettingsLayoutProps {
	title: string;
	description?: string;
	children: React.ReactNode;
}

export function SettingsLayout({
	title,
	description,
	children,
}: SettingsLayoutProps) {
	return (
		<div className="flex flex-col">
			<div className="space-y-1">
				<h1 className="text-base font-semibold">{title}</h1>
				{description && <p className="text-muted-foreground">{description}</p>}
			</div>
			<div className="divide-border/50 divide-y">{children}</div>
		</div>
	);
}
