import { ComponentProps, ElementType } from "react";

import { Icons } from "@/components/icons";

export const SUPPORTED_OAUTH_PROVIDERS = ["google"] as const;
export type SupportedOAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number];

export const SUPPORTED_OAUTH_PROVIDER_DETAILS: Record<
  SupportedOAuthProvider,
  { Icon: ElementType<ComponentProps<"svg">>; name: string }
> = {
  google: { Icon: Icons.Google, name: "Google" },
};
