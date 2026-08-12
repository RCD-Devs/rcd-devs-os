import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ToastProvider } from "@/components/ui/Toast";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { esAdmin } from "@/lib/auth/esAdmin";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const usuario = await getCurrentUser();

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar
          esAdmin={esAdmin(usuario)}
          nombre={usuario?.nombre ?? usuario?.email ?? null}
        />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
