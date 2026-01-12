"use client";

import { links } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed block bottom-0 inset-x-0 z-50 max-w-md mx-auto border-t bg-background">
      <div className="grid auto-fit-5xl px-safe gap-2 py-2.5 standalone:pb-safe">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 text-[.6875rem]/none text-muted-foreground font-semibold tracking-wide transition-colors hover:text-primary [&_svg:not([class*='size-'])]:size-6 shrink-0 [&_svg]:shrink-0",
                {
                  "text-primary": isActive,
                }
              )}
            >
              <link.icon />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
