"use client";

import { ComponentProps, useState } from "react";

import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordInput({
  className,
  ...props
}: Omit<ComponentProps<typeof Input>, "type">) {
  const [showPassword, setShowPassword] = useState(false);
  const Icon = showPassword ? Icons.eyeClosed : Icons.eye;

  return (
    <div className="relative">
      <Input
        className={cn(className)}
        type={showPassword ? "text" : "password"}
        {...props}
        data-name="password-input"
      />
      <button
        className="absolute right-2 top-6 text-muted-foreground -mt-2.5 [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0"
        onClick={() => setShowPassword((prev) => !prev)}
        type="button"
      >
        <Icon aria-hidden="true" />
        <span className="sr-only">
          {showPassword ? "Hide password" : "Show password"}
        </span>
      </button>
    </div>
  );
}
