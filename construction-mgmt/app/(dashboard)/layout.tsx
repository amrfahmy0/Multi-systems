import Sidebar from "@/components/sidebar";
import { ToastProvider } from "@/components/toast-provider";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        {/* Main content area offset by sidebar width on desktop, top offset on mobile */}
        <main className="flex-1 flex flex-col lg:ms-56 mt-14 lg:mt-0 min-h-screen w-full bg-zinc-50/50 overflow-x-hidden">
          <div className="w-full h-full p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
