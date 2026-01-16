import { Icons } from "@/components/icons";

export const site = {
  description: "Track your workouts and share with friends",
  name: "Freeletics",
  ogImage: "/og.png",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const VISIBILITY = ["FOLLOWERS", "PUBLIC", "PRIVATE"] as const;
export type Visibility = (typeof VISIBILITY)[number];

export const links = [
  { href: "/", label: "Home", icon: Icons.home },
  { href: "/exercises", label: "Exercises", icon: Icons.running },
  { href: "/workouts", label: "Workouts", icon: Icons.dumbbell },
  { href: "/progress", label: "Progress", icon: Icons.clockDashedHalf },
  { href: "/settings", label: "Settings", icon: Icons.cog },
];

type PageInfo = {
  name: string;
};

export function getPageInfo(pathname: string): PageInfo {
  const path = normalizePath(pathname);
  const allNavs = [...links];

  const exact = allNavs.find((item) => normalizePath(item.href) === path);
  if (exact)
    return {
      name: exact.label,
    };

  const sorted = allNavs
    .slice()
    .sort(
      (a, b) => normalizePath(b.href).length - normalizePath(a.href).length
    );

  const prefix = sorted.find((item) => {
    const href = normalizePath(item.href);
    if (href === "/") return false;
    return path === href || path.startsWith(href + "/");
  });

  if (prefix)
    return {
      name: prefix.label,
    };

  const home = allNavs.find((i) => i.href === "/");
  return {
    name: home ? home.label : "",
  };
}

function normalizePath(p: string) {
  if (!p) return "/";
  const q = p.split("?")[0].split("#")[0];
  return q !== "/" && q.endsWith("/") ? q.slice(0, -1) : q;
}
