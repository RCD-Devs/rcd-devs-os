"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Building2,
  ClipboardList,
  FolderKanban,
  History,
  Inbox,
  LayoutDashboard,
  Menu,
  User,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/alertas", label: "Alertas", icon: Bell, adminOnly: false },
  { href: "/protocolos", label: "Protocolos", icon: ClipboardList, adminOnly: false },
  { href: "/proyectos", label: "Proyectos", icon: FolderKanban, adminOnly: false },
  { href: "/clientes", label: "Clientes", icon: Building2, adminOnly: false },
  { href: "/solicitudes", label: "Solicitudes", icon: Inbox, adminOnly: false },
  // Solo Lider tecnico y Director/a (Rol.esAdmin): roles, usuarios, auditoria y
  // configuracion de permisos, no el resto de la operacion diaria.
  { href: "/auditoria", label: "Auditoría", icon: History, adminOnly: true },
  { href: "/usuarios", label: "Usuarios", icon: UserCog, adminOnly: true },
  { href: "/roles", label: "Roles", icon: Users, adminOnly: true },
];

export function Sidebar({
  esAdmin,
  nombre,
}: {
  esAdmin: boolean;
  nombre: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Cierra el drawer mobile al navegar: se ajusta durante el render (patron
  // React de "adjust state when a prop changes"), no en un efecto, para
  // evitar el frame extra de un setState dentro de useEffect.
  const [pathnameAnterior, setPathnameAnterior] = useState(pathname);
  if (pathname !== pathnameAnterior) {
    setPathnameAnterior(pathname);
    setOpen(false);
  }

  const links = NAV_LINKS.filter((link) => !link.adminOnly || esAdmin);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden print:hidden">
        <Link href="/dashboard" className="text-sm font-bold tracking-tight text-text">
          RCD OS
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="flex size-9 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text"
        >
          <Menu size={20} strokeWidth={2} />
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 -translate-x-full flex-col border-r border-border bg-surface transition-transform duration-200 md:sticky md:top-0 md:z-auto md:w-60 md:translate-x-0 print:hidden ${
          open ? "translate-x-0" : ""
        }`}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <Link href="/dashboard" className="text-sm font-bold tracking-tight text-text">
            RCD OS
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menu"
            className="flex size-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text md:hidden"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-accent/10 text-accent" : "text-text-muted hover:bg-surface-hover hover:text-text"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/perfil"
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/perfil"
                ? "bg-accent/10 text-accent"
                : "text-text-muted hover:bg-surface-hover hover:text-text"
            }`}
          >
            <User size={17} strokeWidth={2} />
            <span className="truncate">{nombre ?? "Perfil"}</span>
          </Link>
          <ThemeToggle className="w-full" />
          <LogoutButton className="mt-1 w-full justify-start gap-2.5 border-none px-3 shadow-none" />
        </div>
      </aside>
    </>
  );
}
