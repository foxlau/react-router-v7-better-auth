import {
	HardDriveIcon,
	KeyIcon,
	Link2Icon,
	type LucideIcon,
	SunMoonIcon,
	UserIcon,
} from "lucide-react";
import { href, NavLink } from "react-router";

import { cn } from "~/lib/utils";

interface MenuItem {
	title: string;
	url: string;
	icon: LucideIcon;
}

const menuItems: MenuItem[] = [
	{
		title: "Account",
		url: href("/settings/account"),
		icon: UserIcon,
	},
	{
		title: "Appearance",
		url: href("/settings/appearance"),
		icon: SunMoonIcon,
	},
	{
		title: "Connections",
		url: href("/settings/connections"),
		icon: Link2Icon,
	},
	{
		title: "Sessions",
		url: href("/settings/sessions"),
		icon: HardDriveIcon,
	},
	{
		title: "Password",
		url: href("/settings/password"),
		icon: KeyIcon,
	},
];

export function Menu() {
	return (
		<div className="pb-12">
			<div className="relative flex gap-6 overflow-x-auto sm:gap-8">
				{menuItems.map((item) => (
					<NavLink
						key={item.title}
						to={item.url}
						className={({ isActive }) =>
							cn(
								"relative flex items-center justify-start gap-1.5 py-4 text-muted-foreground",
								{
									"font-medium text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground after:content-['']":
										isActive,
								},
							)
						}
					>
						<item.icon className="size-4" />
						<span>{item.title}</span>
					</NavLink>
				))}
				<div className="absolute inset-x-0 bottom-0 -z-10 h-0.5 bg-muted" />
			</div>
		</div>
	);
}
