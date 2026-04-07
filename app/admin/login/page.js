import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";

export const metadata = {
  title: "Admin Login — Ghost AI Solutions",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  if (verifyAdminSessionToken(token)) {
    redirect("/admin");
  }

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LoginForm />
      </div>
    </section>
  );
}
