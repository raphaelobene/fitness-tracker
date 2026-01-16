"use client";

import AuthWrapper from "@/components/auth-wrapper";
import CustomFormField, { FormFieldType } from "@/components/custom-form-field";
import { LoadingSwap } from "@/components/loading-swap";
import { Button, buttonVariants } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useSpinDelay } from "@/hooks/use-spin-delay";
import { signIn } from "@/lib/auth/auth-client";
import { site } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SignInInput, signInSchema } from "@/lib/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function SigngInPage() {
  const router = useRouter();

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { isSubmitting } = form.formState;

  const showSpinner = useSpinDelay(isSubmitting, {
    delay: 300,
    minDuration: 500,
  });

  function onSubmit(data: SignInInput) {
    signIn.email(
      { ...data, callbackURL: "/" },
      {
        onError: (error) => {
          toast(error.error.message || "Invalid credentials");
        },
        onSuccess: () => {
          router.push("/feed");
          router.refresh();
        },
      }
    );
  }

  return (
    <AuthWrapper
      description={
        <>
          Don&apos;t have an account?{" "}
          <Link
            aria-label="Sign up"
            prefetch={false}
            className={cn(
              buttonVariants({ variant: "link" }),
              "h-auto rounded-none p-0 font-normal underline-offset-1"
            )}
            href="/sign-up"
          >
            Sign up
          </Link>
        </>
      }
      footer={
        <>
          By signing in, you agree to our{" "}
          <Link
            aria-label="Terms"
            prefetch={false}
            className={cn(
              buttonVariants({ size: "sm", variant: "link" }),
              "h-auto rounded-none p-0 text-xs font-normal underline-offset-1"
            )}
            href="/"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            aria-label="Privacy"
            prefetch={false}
            className={cn(
              buttonVariants({ size: "sm", variant: "link" }),
              "h-auto rounded-none p-0 text-xs font-normal underline-offset-1"
            )}
            href="/"
          >
            Privacy Policy
          </Link>
          .
        </>
      }
      isSocialAllowed
      title={`Sign in to ${site.name}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            label="Email"
            name="email"
            placeholder="alan.turing@example.com"
            disabled={showSpinner}
            type="email"
            variant="lg"
          />

          <CustomFormField
            fieldType={FormFieldType.PASSWORD_INPUT}
            label="Password"
            name="password"
            placeholder="••••••••"
            disabled={showSpinner}
            renderAfter={
              <Link
                aria-label="Forgot your password?"
                prefetch={false}
                className={cn(
                  buttonVariants({ size: "lg", variant: "link" }),
                  "h-auto rounded-none p-0 font-normal"
                )}
                href="/reset-password"
              >
                Forgot your password?
              </Link>
            }
            variant="lg"
          />

          <Button
            size="lg"
            type="submit"
            className="w-full"
            disabled={showSpinner}
          >
            <LoadingSwap isLoading={showSpinner}>Sign in</LoadingSwap>
          </Button>
        </form>
      </Form>
    </AuthWrapper>
  );
}
