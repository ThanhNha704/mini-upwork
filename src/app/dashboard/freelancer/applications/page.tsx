// src/app/dashboard/freelancer/applications/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

type ApplicationItem = {
  id: string;
  bidAmount: number;
  proposal: string;
  status: string;
  job: {
    title: string;
    budget: number;
  };
};

const statusColors: any = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  WITHDRAWN: "bg-slate-100 text-slate-700",
};

export default function MyApplications() {
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      fetch("/api/freelancers/applications")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setApplications(data);
          } else {
            setError(data.error || "Không thể tải dữ liệu");
          }
        })
        .catch((err) => {
          console.error("Error fetching applications:", err);
          setError("Lỗi tải dữ liệu ứng tuyển");
        })
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-violet-600" size={36} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Đăng nhập để xem hồ sơ ứng tuyển</h1>
        <button onClick={() => signIn()} className="rounded-full bg-linear-to-r from-violet-600 to-cyan-500 px-8 py-3 text-white font-bold shadow-lg hover:opacity-90 transition">
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đơn ứng tuyển của tôi</h1>
      
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-violet-600" size={28} />
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          Bạn chưa ứng tuyển vào dự án nào.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold">Dự án</th>
                <th className="p-4 font-semibold">Giá thầu</th>
                <th className="p-4 font-semibold">Ngân sách</th>
                <th className="p-4 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                  <td className="p-4 font-medium text-violet-600">{app.job.title}</td>
                  <td className="p-4">${app.bidAmount.toFixed(2)}</td>
                  <td className="p-4 text-slate-500">${app.job.budget.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[app.status] || statusColors.PENDING}`}>
                      {app.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}