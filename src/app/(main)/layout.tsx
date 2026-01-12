import BottomNav from "@/components/bottom-nav";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-md mx-auto">
      <main className="px-safe-or-4 min-h-fill-safe pb-safe-or-18">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
