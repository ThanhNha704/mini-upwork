"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getClientJobs } from "@/src/actions/jobActions";
import { PlusCircle, Eye, Briefcase, ChevronRight } from "lucide-react";

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientJobs()
      .then(setJobs)
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    const colors: any = {
      OPEN: "text-green-600 bg-green-50 border-green-100",
      IN_PROGRESS: "text-blue-600 bg-blue-50 border-blue-100",
      COMPLETED: "text-purple-600 bg-purple-50 border-purple-100",
      CLOSED: "text-gray-600 bg-gray-50 border-gray-100",
    };
    return colors[status] || "text-gray-600 bg-gray-50";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dự án của tôi</h1>
          <p className="text-sm text-gray-500">Quản lý tất cả các công việc bạn đã đăng tải.</p>
        </div>
        <Link href="/dashboard/client/post-job" className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-violet-600 to-cyan-500 px-6 py-3 text-white font-bold shadow-lg hover:opacity-95 transition">
          <PlusCircle size={18} /> Đăng dự án mới
        </Link>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <p className="text-center py-10">Đang tải danh sách dự án...</p>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <Briefcase className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Bạn chưa đăng dự án nào.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-all shadow-sm flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-bold text-gray-900">{job.title}</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Ngân sách: <strong className="text-gray-900">${job.budget}</strong></span>
                  <span>•</span>
                  <span>Đăng ngày: {new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              <Link
                href={`/dashboard/client/manage-jobs/${job.id}`}
                className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Quản lý <ChevronRight size={18} />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}