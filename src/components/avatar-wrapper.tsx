import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/auth/auth";
import { cn, getInitials } from "@/lib/utils";

type AvatarWrapperProps = {
  user: User;
};
export default function AvatarWrapper({
  className,
  user,
  ...props
}: AvatarWrapperProps & React.ComponentProps<"div">) {
  return (
    <Avatar className={cn(className)} {...props}>
      <AvatarImage src={user.image || ""} />
      <AvatarFallback>{getInitials(user.name ?? user.username)}</AvatarFallback>
    </Avatar>
  );
}
