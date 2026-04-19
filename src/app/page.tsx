import { redirect } from "next/navigation";
import { createClient } from "@/src/utils/supabase/server"; // Lưu ý: Dùng bản cho server

import { Hero } from "@/src/components/home/Hero";
import { Stats } from "@/src/components/home/Stats";
import { Categories } from "@/src/components/home/Categories";
import { FeaturedFreelancers } from "@/src/components/home/FeaturedFreelancers";

export default async function Home() {
  // 1. Khởi tạo Supabase client (Server Side)
  const supabase = await createClient();

  // 2. Kiểm tra xem người dùng đã đăng nhập chưa
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // 3. Nếu đã đăng nhập, lấy 'role' từ bảng 'users' (giống cách làm ở Profile)
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    // 4. Điều hướng dựa trên role (lowercase để khớp với code Profile của bạn)
    if (profile?.role === "freelancer") {
      redirect("/dashboard/freelancer");
    }

    if (profile?.role === "client") {
      redirect("/dashboard/client/manage-jobs");
    }
  }

  // --- LANDING PAGE (Chỉ hiển thị khi chưa đăng nhập) ---
  return (
    <main className="min-h-screen bg-gray-50 font-sans selection:bg-violet-100">
      
      {/* Hero Section */}
      <section className="w-full bg-linear-to-br from-violet-600 to-cyan-500 shadow-inner">
        <Hero />
      </section>

      {/* Các section bổ trợ */}
      <div className="max-w-7xl mx-auto space-y-20 pb-20">
        
        <section className="w-full mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Stats />
        </section>

        <section className="w-full px-6">
          <Categories />
        </section>

        <section className="w-full px-6">
          <FeaturedFreelancers />
        </section>

      </div>
    </main>
  );
}