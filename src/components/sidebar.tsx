"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Send,
  BarChart3,
  Settings,
  MessageSquare,
  Activity,
  Mail,
  Search,
  Globe,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/suivi", label: "Metrics", icon: BarChart3 },
  { href: "/trafic", label: "Trafic", icon: Activity },
  { href: "/seo", label: "SEO", icon: Search },
  { href: "/campagnes", label: "Campagnes avis", icon: Send },
  { href: "/mail", label: "Mail satisfaction", icon: Mail },
  { href: "/resultats", label: "Résultats enquête", icon: Globe },
  { href: "/avis", label: "Avis Google", icon: MessageSquare },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <Image src="/logo.svg" alt="Novadev" width={120} height={40} />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium">
            BL
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Dr. Landman</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
