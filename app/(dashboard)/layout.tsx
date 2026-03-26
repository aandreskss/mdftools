import Sidebar from "@/components/Sidebar";
import ApiKeyBanner from "@/components/ApiKeyBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen flex flex-col">
        <ApiKeyBanner />
        {children}
      </main>
    </div>
  );
}
