"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const supabase = createClient();
    // No se ramifica sobre el resultado: la UI responde igual exista o no la
    // cuenta, para no filtrar qué emails están registrados.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    setSubmitted(true);
  }

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-lg font-medium">Recuperar contrasena</h1>

        {submitted ? (
          <p className="text-sm text-neutral-600">
            Si el email existe en el sistema, se envio un link para restablecer la contrasena.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm text-neutral-600">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded bg-neutral-900 px-3 py-2 text-sm text-white"
            >
              Enviar link
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
