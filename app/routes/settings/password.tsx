import { href, Link } from "react-router";
import { ChangePassword } from "~/components/settings/password-action";
import { SettingRow } from "~/components/settings/setting-row";
import { SettingsLayout } from "~/components/settings/settings-layout";
import { buttonVariants } from "~/components/ui/button";
import { cn, getPageTitle } from "~/lib/utils";

export function meta() {
	return [{ title: getPageTitle("Password") }];
}

export default function ChangePasswordRoute() {
	return (
		<SettingsLayout title="Password">
			<SettingRow
				title="Change your password"
				description="If you have already set your password, you can update it here. If you have forgotten your password, please reset it below."
				action={<ChangePassword />}
			/>
			<SettingRow
				title="Reset your password"
				description="If you have forgotten your password, you can reset it here. Alternatively, if have signed up via Github / Google and more, you can set your password here too."
				action={
					<Link
						target="_blank"
						to={href("/auth/forget-password")}
						className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
					>
						Reset password ↗
					</Link>
				}
			/>
		</SettingsLayout>
	);
}
