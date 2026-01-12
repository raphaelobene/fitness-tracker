"use client";

import { getPageInfo } from "@/lib/constants";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { Icons } from "./icons";

export default function HeaderActions({
  children,
  title,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { name } = getPageInfo(pathname);

  const onClick = useCallback(() => router.back(), [router]);

  return (
    <div className="flex items-center gap-3 pt-safe-offset-4 bg-background sticky top-0 z-10 pb-2 -mx-safe-or-4 px-safe-offset-4">
      <div className="flex flex-1 items-center gap-5">
        <button
          onClick={onClick}
          title="Back"
          className="isolate cursor-pointer outline-none -mx-2 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-6.5 shrink-0 [&_svg]:shrink-0 text-primary"
        >
          <span className="sr-only">Back</span>
          <Icons.arrowLeft />
        </button>
        {/* <div className="font-semibold line-clamp-1">{title ?? name}</div> */}
      </div>
      <div className="inline-flex items-center gap-6">{children}</div>
    </div>
  );
}
