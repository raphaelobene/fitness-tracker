import React from "react";

import { AuthButtons } from "./auth-buttons";
import { Separator } from "./ui/separator";

export default function AuthWrapper({
  children,
  description,
  footer = null,
  isSocialAllowed = false,
  title,
}: {
  children: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  isSocialAllowed?: boolean;
  title: string;
}) {
  return (
    <div className="max-w-lg mx-auto flex flex-col gap-3 py-14 px-8">
      <div className="text-center space-y-2">
        <div className="md:text-3xl text-2xl leading-none font-semibold">
          {title}
        </div>
        <div className="text-muted-foreground text-sm">{description}</div>
        {isSocialAllowed && (
          <div className="flex w-full flex-col items-center gap-y-5 py-4">
            <div className="grid auto-fit-[10rem] w-full gap-4 pb-2">
              <AuthButtons />
            </div>
            <div className="relative w-full">
              <Separator className="absolute top-1/2 -translate-y-[0.5px]" />
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-4 font-medium">
                  Or continue with
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      {children}
      {footer && (
        <div className="text-center">
          <p className="text-muted-foreground text-xs">{footer}</p>
        </div>
      )}
    </div>
  );
}
