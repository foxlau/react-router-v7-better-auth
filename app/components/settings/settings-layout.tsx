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
				<h1 className="font-semibold text-base">{title}</h1>
				{description && <p className="text-muted-foreground">{description}</p>}
			</div>
			<div className="divide-y divide-border/50">{children}</div>
		</div>
	);
}
