"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-bg p-8">
      <p className="text-sm font-semibold tracking-tight text-text">RCD OS</p>

      <Card className="w-full max-w-sm p-6">
        <h1 className="text-lg font-medium">Recuperar contrasena</h1>

        {submitted ? (
          <p className="mt-4 text-sm text-text-muted">
            Si el email existe en el sistema, se envio un link para restablecer la contrasena.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm text-text-muted">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Enviar link
            </Button>
          </form>
        )}
      </Card>
    </main>
  );
}
