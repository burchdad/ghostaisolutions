// Search directives do not replace or change the existing authentication checks.
export const metadata = { robots: { index: false, follow: false } };

import AdminShell from "@/components/AdminShell";

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
