// Search directives do not replace or change the existing authentication checks.
export const metadata = { robots: { index: false, follow: false } };

export default function ClientPortalLayout({ children }) {
  return children;
}
