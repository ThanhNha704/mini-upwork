import { redirect } from "next/navigation";
import { createClient } from "@/src/utils/supabase/server";
import { Hero } from "@/src/components/home/Hero";
import { Stats } from "@/src/components/home/Stats";
import { LatestJobs } from "@/src/components/home/LatestJobs";
import { FeaturedFreelancers } from "@/src/components/home/FeaturedFreelancers";


// ... các import giữ nguyên
export default async function Home() {
  const supabase = await createClient();
  

  // 1. Check Auth & Redirect (Giữ nguyên logic cũ của bạn)
  const { data: { user } } = await supabase.auth.getUser();
  // ... logic redirect ...

  // 2. FETCH DỮ LIỆU THỰC TẾ
  const [counts, recentJobs, freelancers] = await Promise.all([
    supabase.rpc('get_landing_stats'),
    
    // FETCH JOBS: Lấy 4-8 dự án mới nhất đang ở trạng thái OPEN
    supabase.from('job')
      .select(`
        *,
        client:users!clientId(full_name, avatar_url)
      `)
      .eq('status', 'OPEN')
      .order('createdAt', { ascending: false })
      .limit(8),

    supabase.from('users')
      .select('full_name, avatar_url, bio, price')
      .eq('role', 'FREELANCER')
      .not('avatar_url', 'is', null)
      .limit(4)
  ]);

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <section className="w-full bg-linear-to-br from-violet-600 to-cyan-500 shadow-inner">
        <Hero />
      </section>

      <div className="max-w-7xl mx-auto space-y-20 pb-20">
        <section className="w-full mt-12">
          <Stats data={counts.data} />
        </section>

        {/* Đổi Categories thành hiển thị Jobs */}
        <section className="w-full px-6">
          <LatestJobs items={recentJobs.data || []} />
        </section>

        <section className="w-full px-6">
          <FeaturedFreelancers list={freelancers.data || []} />
        </section>
      </div>
    </main>
  );
}