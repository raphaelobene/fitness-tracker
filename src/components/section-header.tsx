import { cn } from "@/lib/utils";

function SectionActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 **:data-[slot=button]:shadow-none",
        className
      )}
      data-slot="section-header-actions"
      {...props}
    />
  );
}

function SectionHeader({
  children,
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className="border-grid" {...props}>
      <div className="container-wrapper">
        <div className={cn("flex items-start gap-3", className)}>
          {children}
        </div>
      </div>
    </section>
  );
}

function SectionHeaderDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-muted-foreground max-w-3xl text-pretty text-sm",
        className
      )}
      data-slot="section-header-description"
      {...props}
    />
  );
}

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type SectionHeaderHeadingProps<T extends HeadingLevel = "h1"> = {
  as?: T;
  className?: string;
} & React.ComponentPropsWithoutRef<T>;

function SectionHeaderHeading<T extends HeadingLevel = "h1">({
  as,
  className,
  ...props
}: SectionHeaderHeadingProps<T>) {
  const Component = as ?? "h1";

  return (
    <Component
      className={cn(
        "max-w-2xl font-semibold leading-[1.1] text-balance",
        className
      )}
      {...props}
    />
  );
}

export {
  SectionActions,
  SectionHeader,
  SectionHeaderDescription,
  SectionHeaderHeading,
};
