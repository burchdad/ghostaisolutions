import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";

export function requireAdmin(nextPath = "/admin") {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  if (!verifyAdminSessionToken(token)) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }
}
