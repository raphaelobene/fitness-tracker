import { cn } from "@/lib/utils";

function ScrollWrapper({
  children,
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className="w-full" {...props}>
      <div className="flex relative overflow-hidden -mx-safe-or-4">
        <div
          className={cn(
            "scrollbar-none snap-x snap-mandatory flex w-full snap-always px-safe-or-4 gap-4 py-3 overflow-x-auto scroll-smooth scroll-px-safe-or-4",
            className
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

function ScrollContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "translate-x-0 translate-y-0 transform snap-start transition-all duration-300",
        className
      )}
      data-slot="scroll-content"
      {...props}
    />
  );
}

export { ScrollContent, ScrollWrapper };
