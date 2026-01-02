import { NavGroup } from "./nav-group";
import { navigationGroups } from "./navigation";

export function NavMain() {
	return (
		<>
			{navigationGroups.map((props) => (
				<NavGroup key={props.id} {...props} />
			))}
		</>
	);
}
