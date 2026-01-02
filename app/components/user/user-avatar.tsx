import BoringAvatar from "boring-avatars";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

type AvatarSize = 16 | 24 | 32 | 40;

interface UserAvatarProps {
	name: string;
	image?: string | null;
	className?: string;
	size?: AvatarSize;
}

// Map size value to Tailwind class name
const getSizeClass = (size: AvatarSize): string => {
	const sizeMap: Record<AvatarSize, string> = {
		16: "size-4",
		24: "size-6",
		32: "size-8",
		40: "size-10",
	};
	return sizeMap[size];
};

export function UserAvatar({
	name,
	image,
	className,
	size = 24,
}: UserAvatarProps) {
	const initials = name.charAt(0).toUpperCase();
	const sizeClass = getSizeClass(size);

	// If image exists, use Avatar component with fallback
	if (image) {
		return (
			<Avatar className={cn(sizeClass, className)}>
				<AvatarImage src={image} alt={name} />
				<AvatarFallback className="rounded-lg font-semibold uppercase">
					{initials}
				</AvatarFallback>
			</Avatar>
		);
	}

	// If no image, use BoringAvatar wrapped in Avatar for consistent styling
	return (
		<Avatar className={cn(sizeClass, className)}>
			<AvatarFallback className="rounded-lg p-0">
				<BoringAvatar
					size={size}
					name={name}
					variant="marble"
					colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
				/>
			</AvatarFallback>
		</Avatar>
	);
}
