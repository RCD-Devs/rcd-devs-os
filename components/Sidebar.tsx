"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ClipboardList, FolderKanban, LayoutDashboard } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/protocolos", label: "Protocolos", icon: ClipboardList },
  { href: "/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/clientes", label: "Clientes", icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="px-5 py-6">
        <Link href="/dashboard" className="text-sm font-bold tracking-tight text-text">
          RCD OS
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-accent/10 text-accent" : "text-text-muted hover:bg-bg hover:text-text"
              }`}
            >
              <Icon size={17} strokeWidth={2} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <LogoutButton className="w-full justify-start gap-2.5 border-none px-3 shadow-none" />
      </div>
    </aside>
  );
}
