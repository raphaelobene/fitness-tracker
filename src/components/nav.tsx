"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as CurrentUser } from "@/lib/auth/auth";
import { signOut } from "@/lib/auth/auth-client";
import { LogOut } from "lucide-react";
import Link from "next/link";
import AvatarWrapper from "./avatar-wrapper";

export function Nav({ user }: { user: CurrentUser }) {
  return (
    <div className="container mx-auto flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <AvatarWrapper user={user} className="size-8" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user.name && <p className="font-medium">{user.name}</p>}
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/profile/${user.username}`}>Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              signOut({
                fetchOptions: {
                  onSuccess: () => {
                    console.log("goto /sign-in");
                    // router.push("/sign-in");
                  },
                },
              })
            }
            className="text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
