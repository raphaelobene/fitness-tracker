"use client";

import AuthWrapper from "@/components/auth-wrapper";
import CustomFormField, { FormFieldType } from "@/components/custom-form-field";
import { LoadingSwap } from "@/components/loading-swap";
import { Button, buttonVariants } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useSpinDelay } from "@/hooks/use-spin-delay";
import { signUpAction } from "@/lib/actions/auth.actions";
import { signIn } from "@/lib/auth/auth-client";
import { site } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SignUpInput, signUpSchema } from "@/lib/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
  });
  const { isSubmitting } = form.formState;
  const showSpinner = useSpinDelay(isSubmitting, {
    delay: 300,
    minDuration: 500,
  });

  async function onSubmit(data: SignUpInput) {
    // await signUp.email(
    //   { ...data, callbackURL: "/" },
    //   {
    //     onError: (error) => {
    //       toast(error.error.message || "Failed to create account");
    //     },
    //     onSuccess: () => {
    //       router.push("/feed");
    //       router.refresh();
    //     },
    //   }
    // );

    const result = await signUpAction(data);

    if (result.error) {
      toast(result.error);
      return;
    }

    signIn.email(
      { email: data.email, password: data.password },
      {
        onError: (error) => {
          toast(error.error.message || "Failed to sign up");
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
          Already have an account?{" "}
          <Link
            aria-label="Sign in"
            prefetch={false}
            className={cn(
              buttonVariants({ variant: "link" }),
              "h-auto rounded-none p-0 font-normal underline-offset-1"
            )}
            href="/sign-in"
          >
            Sign in
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
      title={`Create a ${site.name} Account`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            label="Name"
            name="name"
            placeholder="Alan Turing"
            disabled={showSpinner}
            variant="lg"
          />
          {/* <CustomFormField
            fieldType={FormFieldType.INPUT}
            label="Username"
            name="username"
            placeholder="alan_turing"
            variant="lg"
          /> */}

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
            variant="lg"
          />

          <Button
            size="lg"
            type="submit"
            className="w-full"
            disabled={showSpinner}
          >
            <LoadingSwap isLoading={showSpinner}>Create account</LoadingSwap>
          </Button>
        </form>
      </Form>
    </AuthWrapper>
  );
}
