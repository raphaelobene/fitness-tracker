import React from "react";
import { FieldValues, useFormContext } from "react-hook-form";

import { PasswordInput } from "@/components/password-input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";

export enum FormFieldType {
  CHECKBOX = "checkbox",
  HIDDEN_INPUT = "hiddenInput",
  INPUT = "input",
  PASSWORD_INPUT = "passwordInput",
  SELECT = "select",
  SKELETON = "skeleton",
  SWITCH = "switch",
  TEXTAREA = "textarea",
}

interface CustomProps<T extends FieldValues> {
  // ref?: React.RefObject<HTMLInputElement>;
  autoFocus?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  fieldType: FormFieldType;
  itemClassName?: string;
  label?: React.ReactNode;
  labelDescription?: React.ReactNode;
  name: string;
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onFocus?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  renderAfter?: React.ReactNode;
  renderSkeleton?: (field: T) => React.ReactNode;
  type?: string;
  variant?: "lg" | "sm";
}
type RenderInputProps<T extends FieldValues> = Omit<
  CustomProps<T>,
  "itemClassName" | "renderAfter"
>;

const RenderInput = <T extends FieldValues>({
  field,
  props,
}: {
  field: T;
  props: RenderInputProps<T>;
}) => {
  const {
    fieldType,
    labelDescription,
    renderSkeleton,
    label,
    children,
    ...inputProps
  } = props;
  switch (fieldType) {
    case FormFieldType.CHECKBOX:
    case FormFieldType.SWITCH:
      return (
        <FormControl>
          <div
            className={cn("flex items-center gap-2", {
              "items-start": labelDescription,
            })}
          >
            <Checkbox
              checked={field.value}
              className={cn(
                "size-5 shadow-none",
                {
                  "mt-1": labelDescription,
                },
                inputProps.className
              )}
              id={inputProps.name}
              name={inputProps.name}
              disabled={inputProps.disabled}
              onCheckedChange={field.onChange}
            />
            <div className="space-y-1">
              {label && (
                <Label className="cursor-pointer" htmlFor={inputProps.name}>
                  {label}
                </Label>
              )}
              {labelDescription && (
                <FormDescription>{labelDescription}</FormDescription>
              )}
            </div>
          </div>
        </FormControl>
      );
    case FormFieldType.HIDDEN_INPUT:
      return (
        <FormControl>
          <Input
            id={inputProps.name}
            {...inputProps}
            autoComplete={`${inputProps.name} webauthn`}
            {...field}
          />
        </FormControl>
      );
    case FormFieldType.INPUT:
      return (
        <FormControl>
          <Input
            id={inputProps.name}
            {...inputProps}
            autoComplete={`${inputProps.name} webauthn`}
            {...field}
          />
        </FormControl>
      );
    case FormFieldType.PASSWORD_INPUT:
      return (
        <FormControl>
          <PasswordInput
            autoComplete={`${inputProps.name} webauthn`}
            id={inputProps.name}
            {...inputProps}
            {...field}
          />
        </FormControl>
      );
    case FormFieldType.SELECT:
      return (
        <FormControl>
          <Select
            autoComplete="on"
            defaultValue={field.value}
            name={inputProps.name}
            onValueChange={field.onChange}
          >
            <FormControl>
              <SelectTrigger
                id={inputProps.name}
                className={inputProps.className}
              >
                <SelectValue placeholder={inputProps.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>{children}</SelectContent>
          </Select>
        </FormControl>
      );
    case FormFieldType.SKELETON:
      return renderSkeleton ? renderSkeleton(field) : null;
    case FormFieldType.TEXTAREA:
      return (
        <FormControl>
          <div className="flex flex-col gap-2">
            {labelDescription && (
              <FormDescription>{labelDescription}</FormDescription>
            )}
            <Textarea id={inputProps.name} {...inputProps} {...field} />
          </div>
        </FormControl>
      );
    default:
      return null;
  }
};
const CustomFormField = <T extends FieldValues>({
  itemClassName,
  label,
  name,
  ...props
}: CustomProps<T>) => {
  const { control } = useFormContext();

  const isPassword = props.fieldType === FormFieldType.PASSWORD_INPUT;
  const isToggle =
    props.fieldType === FormFieldType.CHECKBOX ||
    props.fieldType === FormFieldType.SWITCH;

  const shouldShowLabel = isPassword || !isToggle;
  const shouldShowPasswordWithRenderAfter = isPassword && !!props.renderAfter;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex-1 gap-0.5", itemClassName)}>
          <div className="flex flex-col gap-y-2">
            {shouldShowPasswordWithRenderAfter ? (
              <div className="flex items-center">
                <FormLabel
                  className="flex flex-1 items-center gap-x-1"
                  htmlFor={name}
                >
                  {label}
                </FormLabel>
                {props.renderAfter}
              </div>
            ) : (
              shouldShowLabel &&
              label && (
                <FormLabel className="flex items-center gap-x-1" htmlFor={name}>
                  {label}
                </FormLabel>
              )
            )}
            <RenderInput
              field={field as unknown as T}
              props={{ ...props, label, name }}
            />
          </div>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
