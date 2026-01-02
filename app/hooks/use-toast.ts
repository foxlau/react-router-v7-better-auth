import { useEffect } from "react";
import { toast as showToast } from "sonner";
import type { Toast } from "~/services/toast.server";

export function useToast(toast?: Toast | null) {
	useEffect(() => {
		if (toast) {
			setTimeout(() => {
				showToast[toast.type](toast.title, {
					id: toast.id,
					description: toast.description,
				});
			}, 0);
		}
	}, [toast]);
}
