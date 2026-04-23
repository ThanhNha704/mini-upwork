import { createClient } from "@/src/utils/supabase/server";
import { Hero } from "@/src/components/home/Hero";
import { Stats } from "@/src/components/home/Stats";
import { LatestJobs } from "@/src/components/home/LatestJobs";
import { FeaturedFreelancers } from "@/src/components/home/FeaturedFreelancers";

export default async function Home() {
  const supabase = await createClient();

  // Check Auth & Redirect
  const { data: { user } } = await supabase.auth.getUser();

  // FETCH DỮ LIỆU THỰC TẾ
  const [counts, recentJobs, freelancers] = await Promise.all([
    supabase.rpc('get_landing_stats'),
    
    // Lấy 8 dự án mới nhất đang ở trạng thái OPEN
    supabase.from('job')
      .select(`
        *,
        client:users!clientId(full_name, avatar_url)
      `)
      .eq('status', 'OPEN')
      .order('createdAt', { ascending: false })
      .limit(8),
      //  Lấy 4 freelancer
    supabase.from('users')
      .select('full_name, avatar_url, bio, price')
      .eq('role', 'FREELANCER')
      .limit(4)
  ]);

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <section className="w-full bg-linear-to-br from-violet-600 to-cyan-500 shadow-inner">
        <Hero />
      </section>

      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        <section className="w-full mt-12">
          <Stats data={counts.data} />
        </section>

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