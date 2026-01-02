import { useEffect, useRef, useState } from "react";
import { callAll } from "~/lib/utils";

export function useDoubleCheck() {
	const [doubleCheck, setDoubleCheck] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (doubleCheck && buttonRef.current) {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					buttonRef.current &&
					!buttonRef.current.contains(event.target as Node)
				) {
					setDoubleCheck(false);
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}
	}, [doubleCheck]);

	function getButtonProps(
		props?: React.ButtonHTMLAttributes<HTMLButtonElement>,
	) {
		const onClick: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"] =
			doubleCheck
				? undefined
				: (e) => {
						e.preventDefault();
						setDoubleCheck(true);
					};

		const onKeyUp: React.ButtonHTMLAttributes<HTMLButtonElement>["onKeyUp"] = (
			e,
		) => {
			if (e.key === "Escape") {
				setDoubleCheck(false);
			}
		};

		return {
			...props,
			onClick: callAll(onClick, props?.onClick),
			onKeyUp: callAll(onKeyUp, props?.onKeyUp),
			ref: buttonRef,
		};
	}

	return { doubleCheck, setDoubleCheck, getButtonProps };
}
