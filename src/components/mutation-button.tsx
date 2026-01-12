"use client";

import { UseMutationResult } from "@tanstack/react-query";
import type { ComponentProps } from "react";

import { LoadingSwap } from "@/components/loading-swap";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MutationFn<TData = unknown, TVariables = void> = UseMutationResult<
  TData,
  Error,
  TVariables
>["mutate"];

export function MutationButton<TData = unknown, TVariables = void>({
  mutation,
  mutationArgs,
  actionButtonText = "Yes",
  actionButtonClassname,
  areYouSureDescription = (
    <>
      <span>Are you sure you want to delete?</span>
      <span className="text-destructive font-semibold">
        This action cannot be undone.
      </span>
    </>
  ),
  requireAreYouSure = false,
  isLoading = false,
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick"> & {
  mutation: MutationFn<TData, TVariables>;
  mutationArgs?: TVariables;
  areYouSureDescription?: React.ReactNode;
  actionButtonText?: string;
  actionButtonClassname?: string;
  requireAreYouSure?: boolean;
  isLoading?: boolean;
}) {
  function performAction() {
    mutation(mutationArgs as TVariables);
  }

  if (requireAreYouSure) {
    return (
      <AlertDialog open={isLoading ? true : undefined}>
        <AlertDialogTrigger asChild>
          <Button {...props} />
        </AlertDialogTrigger>
        <AlertDialogContent className="sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{actionButtonText}</AlertDialogTitle>
            <AlertDialogDescription>
              {areYouSureDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "not-disabled:hover:text-foreground bg-muted/40 border"
              )}
            >
              Nevermind
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={performAction}
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                actionButtonClassname
              )}
            >
              <LoadingSwap isLoading={isLoading}>
                {actionButtonText}
              </LoadingSwap>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      {...props}
      disabled={props.disabled ?? isLoading}
      onClick={performAction}
    >
      <LoadingSwap isLoading={isLoading}>{props.children}</LoadingSwap>
    </Button>
  );
}
