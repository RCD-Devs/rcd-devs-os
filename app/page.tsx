import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export default async function Home() {
  const usuario = await getCurrentUser();
  redirect(usuario ? "/dashboard" : "/login");
}
