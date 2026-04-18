"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Loader2, Briefcase, PlusCircle } from "lucide-react";
import Link from "next/link";

type JobItem = {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
};

export default function ClientManageJobsPage() {
  // const { data: session, status } = useSession();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   if (status === "authenticated") {
  //     setLoading(true);
  //     fetch("/api/jobs?mine=true")
  //       .then((res) => res.json())
  //       .then((data) => setJobs(data))
  //       .catch(() => setJobs([]))
  //       .finally(() => setLoading(false));
  //   }
  // }, [status]);

  // if (status === "loading") {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-slate-50">
  //       <Loader2 className="animate-spin text-violet-600" size={36} />
  //     </div>
  //   );
  // }

  // if (!session) {
  //   return (
  //     <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
  //       <h1 className="text-3xl font-bold text-slate-900 mb-4">Đăng nhập để quản lý dự án</h1>
  //       <button onClick={() => signIn()} className="rounded-full bg-linear-to-r from-violet-600 to-cyan-500 px-8 py-3 text-white font-bold shadow-lg hover:opacity-90 transition">
  //         Đăng nhập
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quản lý dự án của bạn</h1>
            <p className="text-slate-500">Xem danh sách dự án, chỉnh sửa hoặc thêm dự án mới.</p>
          </div>
          <Link href="/jobs/create" className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-violet-600 to-cyan-500 px-6 py-3 text-white font-bold shadow-lg hover:opacity-95 transition">
            <PlusCircle size={18} /> Đăng dự án mới
          </Link>
        </div>

        <div className="grid gap-6">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-violet-600" size={28} /></div>
          ) : jobs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
              Bạn chưa có dự án nào. Hãy tạo dự án mới ngay.
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{job.title}</h2>
                    <p className="mt-2 text-slate-600 line-clamp-2">{job.description}</p>
                  </div>
                  <div className="flex flex-col gap-3 text-right">
                    <p className="text-sm text-slate-500">Ngân sách</p>
                    <p className="text-xl font-bold text-slate-900">${job.budget.toFixed(2)}</p>
                    <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-violet-700">{job.status}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
