// src/app/(dashboard)/freelancer/layout.tsx
// import Sidebar from "../../components/dashboard/Sidebar";
// import Header from "../../components/dashboard/Header";
// import { redirect } from "next/navigation";
// import { redirect } from "next/dist/server/api-utils";

import { createClient } from "@/src/utils/supabase/server";

export default async function FreelancerLayout({ children }: { children: React.ReactNode }) {

  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  // if (user?.user_metadata?.role !== 'FREELANCER') {
  //   // handleLogout();
  //   // redirect('./auth/login');
  //   return <div>Bạn không có quyền truy cập trang này.</div>;
  // }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* 1. Sidebar cố định bên trái */}
      {/* <Sidebar /> */}

      <div className="flex-1 flex flex-col">
        {/* 2. Top Header tinh gọn thay cho Navbar cũ */}
        {/* <Header /> */}

        {/* 3. Nội dung trang con */}
        <main className="p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}