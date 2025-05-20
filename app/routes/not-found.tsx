import { useTranslation } from "react-i18next";
import { ProductionErrorDisplay } from "~/components/error-boundary";
import { AppInfo } from "~/lib/config";
import type { Route } from "./+types/not-found";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Not Found - ${AppInfo.name}` }];
};

export async function loader() {
  throw new Response("Not found", { status: 404 });
}

export default function NotFound() {
  return <ErrorBoundary />;
}

export function ErrorBoundary() {
  const { t } = useTranslation();

  return (
    <ProductionErrorDisplay
      message={t("errors.notFound.title")}
      details={t("errors.notFound.description")}
    />
  );
}
