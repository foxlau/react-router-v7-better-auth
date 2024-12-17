import { cn } from "~/lib/utils";

interface SeparatorProps {
  separator?: string;
  count?: number;
  className?: string;
}

export function Separator({
  separator = "· ",
  count = 10,
  className,
}: SeparatorProps) {
  const separatorString = separator.repeat(count);

  return (
    <div className={cn("w-full text-muted-foreground/50", className)}>
      {separatorString}
    </div>
  );
}
