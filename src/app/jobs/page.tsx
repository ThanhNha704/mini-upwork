"use client";

import React, { useState, useEffect } from "react";
import { getAllJobsAction, applyJobAction } from "@/src/actions/jobActions";
import { Filter, ChevronRight } from 'lucide-react'
import Link from "next/link"

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [filters, setFilters] = useState({
    query: "",
    maxPrice: 5000,
    sortBy: "newest",
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getAllJobsAction(filters);
      setJobs(data);
    } catch (error) {
      setMessage({ text: "Không thể tải danh sách công việc", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [filters, message.text]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12 relative font-sans">
      {/* Alert Message */}
      {message.text && (
        <div className={`fixed top-10 right-10 z-50 px-6 py-3 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-600"
          }`}>
          <span className="font-bold">{message.type === "error" ? "Lỗi: " : "Thành công: "}</span>
          {message.text}
        </div>
      )}

      {/* Header Section */}
      <div className="bg-linear-to-br from-violet-600 to-cyan-500 pt-10 pb-10 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 uppercase tracking-tight">Tìm việc làm tự do</h1>
          <p className="opacity-80 mb-8 text-sm md:text-base font-medium">Khám phá những dự án phù hợp với kỹ năng của bạn</p>

          <div className="max-w-2xl mx-auto flex gap-2 p-1.5 bg-white rounded-2xl shadow-xl">
            <input
              type="text"
              placeholder="Nhập tên dự án cần tìm..."
              className="flex-1 px-4 py-3 text-gray-700 outline-none rounded-xl font-medium text-sm"
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            />
            <button className="bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl font-bold transition-all text-sm">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 mt-10 flex flex-col md:flex-row gap-8">
        {/* Sidebar Filter */}
        <aside className="w-full md:w-80 bg-white p-3 lg:p-7 rounded-4xl shadow-sm h-fit md:sticky md:top-24 border border-gray-100">
          <div className="items-center gap-3 font-bold text-xl mb-6 uppercase tracking-wider text-slate-800 lg:flex hidden">
            <Filter size={20} className="text-violet-600" /> Bộ lọc
          </div>

          <div className="mb-10">
            <div className="flex justify-between mb-4">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ngân sách tối đa</label>
              <span className="text-violet-600 font-bold text-sm">${filters.maxPrice}</span>
            </div>
            <input
              type="range" min="10" max="5000" step="50"
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
              onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-4">Sắp xếp theo</label>
            <select
              className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-gray-700 font-bold text-sm focus:bg-white focus:border-violet-100 outline-none transition-all"
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="newest">Mới nhất</option>
              <option value="price_desc">Giá: Cao - Thấp</option>
              <option value="price_asc">Giá: Thấp - Cao</option>
            </select>
          </div>
        </aside>

        {/* Job List */}
        <main className="flex-1">
          <div className="flex items-center gap-2 mb-6 px-2 text-gray-400">
            <span className="text-sm font-bold uppercase tracking-widest">Kết quả:</span>
            <span className="text-violet-600 font-bold text-sm">{jobs.length} công việc</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-48 bg-white animate-pulse rounded-4xl"></div>)}
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} setMessage={setMessage} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function JobCard({ job, setMessage }: { job: any; setMessage: any }) {
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const result = await applyJobAction({
        jobId: job.id,
        bidAmount: job.budget,
        proposal: "Tôi quan tâm đến dự án này."
      });
      if (result.success) setMessage({ text: "Ứng tuyển thành công!", type: "success" });
      else setMessage({ text: result.error || "Lỗi ứng tuyển", type: "error" });
    } catch (err) {
      setMessage({ text: "Lỗi kết nối", type: "error" });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all border border-gray-50 group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 bg-green-50 text-green-600 text-sm font-bold rounded-lg uppercase tracking-tighter border border-green-200">
              {job.status}
            </span>
            <span className="text-gray-400 text-sm font-medium">
              {new Date(job.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-violet-600 transition-colors leading-tight">
            {job.title}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-2xl md:text-3xl font-bold text-violet-600 tracking-tight">
            ${job.budget}
          </p>
          {/* <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Fixed Price</span> */}
        </div>
      </div>

      <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-2 italic">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {job.job_required_skills?.map((s: any, idx: number) => (
          <span key={idx} className="px-3.5 py-1.5 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-xl border border-gray-100">
            {s.skills?.name}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <img
            src={job.client?.avatar_url || "https://ui-avatars.com/api/?name=Client"}
            className="w-9 h-9 rounded-xl object-cover border border-gray-100"
            alt="avatar"
          />
          <div>
            <p className="text-sm font-bold text-gray-800 leading-none mb-1">{job.client?.full_name}</p>
            {/* <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Verified Client</p> */}
          </div>
        </div>

        <Link
          href={`/jobs/${job?.id}`}
          className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-all"
        >
          <ChevronRight size={20} />
        </Link>
        <button
          onClick={handleApply}
          disabled={isApplying || job.status !== 'OPEN'}
          className="px-7 py-3 bg-violet-600 text-white text-[11px] font-bold rounded-xl hover:bg-violet-700 transition-all disabled:bg-gray-200 shadow-lg shadow-violet-100"
        >
          {isApplying ? "ĐANG GỬI..." : "ỨNG TUYỂN"}
        </button>
      </div>
    </div>
  );
}