import AdminSubnav from "@/components/AdminSubnav";

export default function AdminAgentsLayout({ children }) {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <AdminSubnav />
      </div>
      {children}
    </>
  );
}
