import Sidebar from "@/components/Sidebar";
import ApiKeyBanner from "@/components/ApiKeyBanner";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main
        className="flex-1 min-h-screen flex flex-col pt-14 md:pt-0"
        style={{
          marginLeft: "var(--sidebar-width, 256px)",
          transition: "margin-left 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <ApiKeyBanner />
        {children}
      </main>
    </div>
  );
}
