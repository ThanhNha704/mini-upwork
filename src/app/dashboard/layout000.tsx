// import { Sidebar } from "@/app/components/shared/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      {/* <Sidebar /> */}
      {/* ml-64 để đẩy nội dung sang phải 256px tránh bị Sidebar che */}
      <main className="flex-1 p-8 ml-64 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}