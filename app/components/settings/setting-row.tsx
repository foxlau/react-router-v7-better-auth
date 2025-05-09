import type React from "react";

interface SettingRowProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function SettingRow({ title, description, action }: SettingRowProps) {
  return (
    <div className="flex items-center gap-4 py-6 sm:gap-16">
      <div className="flex-1">
        <div className="font-medium text-sm leading-none">{title}</div>
        <div className="mt-1.5 text-muted-foreground text-sm">
          {description}
        </div>
      </div>
      {action && (
        <div className="w-40 justify-items-end md:w-48">
          <div className="flex justify-end">{action}</div>
        </div>
      )}
    </div>
  );
}
