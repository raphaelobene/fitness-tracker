"use client";

import { BetterAuthActionButton } from "@/components/better-auth-action-button";
import { authClient } from "@/lib/auth/auth-client";
import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  SUPPORTED_OAUTH_PROVIDERS,
} from "@/lib/auth/o-auth-providers";

export function AuthButtons() {
  return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
    const Icon = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].Icon;

    return (
      <BetterAuthActionButton
        action={() => {
          return authClient.signIn.social({
            callbackURL: "/",
            provider,
          });
        }}
        key={provider}
        size="lg"
        variant="secondary"
      >
        <Icon className="size-4" />
        {SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}
      </BetterAuthActionButton>
    );
  });
}
