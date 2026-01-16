import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "./ui/empty";

interface ErrorCardProps {
  title: string;
  description?: string;
  className?: string;
  actionButton?: React.ReactNode;
}
export default function ErrorCard({
  title,
  description,
  className,
  actionButton,
}: ErrorCardProps) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        {description && (
          <EmptyDescription className="text-balance wrap-break-word hyphens-auto">
            {description}
          </EmptyDescription>
        )}
      </EmptyHeader>
      {actionButton && (
        <EmptyContent className="justify-center">{actionButton}</EmptyContent>
      )}
    </Empty>
  );
}
