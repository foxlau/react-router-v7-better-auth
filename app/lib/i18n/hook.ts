import { useLocation, useSubmit } from "react-router";
import type { SupportedLng } from "./config";

export function useSetLocale() {
  const { pathname, search, hash } = useLocation();
  const submit = useSubmit();

  return (locale: SupportedLng) => {
    submit(
      {
        locale,
        returnTo: pathname + search + hash,
      },
      {
        method: "post",
        action: "/api/locale",
        preventScrollReset: true,
        replace: true,
      },
    );
  };
}
