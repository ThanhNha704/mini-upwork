"use client";

import React, { useState, useEffect } from "react";
import { getAllJobsAction, applyJobAction } from "@/src/actions/jobActions";
import { Filter, X, DollarSign, Send, CheckCircle } from 'lucide-react'
import Link from "next/link"
import { createClient } from "@/src/utils/supabase/client";

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    query: "",
    maxPrice: 5000,
    sortBy: "newest",
  });

  const supabase = createClient();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Lấy user hiện tại để so sánh trạng thái ứng tuyển
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

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
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12 relative font-sans">
      {/* Thông báo */}
      {message.text && (
        <div className={`fixed top-10 right-10 z-100 px-6 py-3 rounded-xl shadow-2xl border animate-in fade-in slide-in-from-right-4 ${message.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-600"
          }`}>
          {message.text}
        </div>
      )}

      {/* Header & Search */}
      <div className="bg-linear-to-br from-violet-600 to-cyan-500 pt-16 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center text-white">
          <h1 className="text-4xl font-bold mb-4 uppercase tracking-tighter">Cơ hội việc làm mới</h1>
          <div className="relative max-w-2xl mx-auto flex gap-2 p-1 bg-white/10 rounded-2xl border border-white/20">
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              className="flex-1 px-4 py-3 bg-white rounded-xl text-gray-700 outline-none font-medium"
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 bg-white p-6 rounded-4xl shadow-xl border border-gray-100 h-fit sticky top-24">
          <div className="flex items-center gap-2 font-bold mb-6 text-gray-800 uppercase text-xs tracking-widest">
            <Filter size={16} /> Bộ lọc nâng cao
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Ngân sách: ${filters.maxPrice}</label>
              <input
                type="range" min="10" max="1000" step="50" value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                className="w-full accent-violet-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Sắp xếp</label>
              <select
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full p-3 bg-gray-50 rounded-xl border-none font-bold text-sm outline-none"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="price_asc">Giá tăng dần</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Job List */}
        <main className="flex-1 space-y-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-[2.5rem]" />)}
            </div>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                currentUserId={currentUserId}
                setMessage={setMessage}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
}

function JobCard({ job, currentUserId, setMessage }: any) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [formData, setFormData] = useState({
    bidAmount: job.budget,
    proposal: ""
  });

  // Kiểm tra ứng tuyển chưa
  const hasApplied = job.application?.some((app: any) => app.freelancerId === currentUserId);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proposal) return alert("Vui lòng nhập thư báo giá");

    setIsApplying(true);
    try {
      const result = await applyJobAction({
        jobId: job.id,
        budget: job.budget,
        bidAmount: formData.bidAmount,
        proposal: formData.proposal
      });
      if (result.success) {
        setMessage({ text: "Ứng tuyển thành công!", type: "success" });
        setShowApplyModal(false);
        window.location.reload();
      } else {
        setMessage({ text: result.error || "Lỗi ứng tuyển", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Lỗi kết nối", type: "error" });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    // Trạng thái, ngân sách dự kiến
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-violet-200 transition-all group">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-violet-600 transition-colors mb-2">{job.title}</h3>
          <div className="flex gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
            <span className="text-green-500 bg-green-100 p-1 rounded-sm ">{job.status}</span>
            <span>•</span>
            <span>{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900">${job.budget}</p>
          <span className="text-xs font-bold text-gray-400 uppercase">Ngân sách dự kiến</span>
        </div>
      </div>
      {/* Mô tả job */}
      <p className="text-gray-500 mb-8 line-clamp-2 italic text-sm leading-relaxed">{job.description}</p>
      {/* Tên, avt client */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <img src={job.client?.avatar_url || `https://ui-avatars.com/api/?name=${job.client?.full_name}`} className="w-10 h-10 rounded-xl" />
          <div>
            <p className="text-sm font-bold text-gray-800">{job.client?.full_name}</p>
            <p className="text-xs font-bold text-gray-400 uppercase">Khách hàng</p>
          </div>
        </div>
        {/* Nút chi tiết và hiện trạng thái đã apply chưa */}
        <div className="flex gap-3">
          <Link href={`/jobs/${job.id}`} className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-100 hover:border-gray-300 transition-all">Chi tiết</Link>

          {hasApplied ? (
            <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-600 rounded-xl font-bold text-sm border border-green-100">
              <CheckCircle size={16} /> Đã ứng tuyển
            </div>
          ) : (
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-8 py-3 bg-linear-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-violet-200 transition-all uppercase"
            >
              Ứng tuyển ngay
            </button>
          )}
        </div>
      </div>

      {/* MODAL ỨNG TUYỂN */}
      {showApplyModal && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowApplyModal(false)} />
          <form
            onSubmit={handleApply}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 uppercase">Gửi báo giá</h2>
              <button type="button" onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Giá chào thầu ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    required
                    value={formData.bidAmount}

                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      const maxLimit = job?.budget || 0;

                      // 2. Logic ngăn chặn nhập quá số tiền ngay khi gõ
                      if (val > maxLimit) {
                        setFormData({ ...formData, bidAmount: maxLimit });
                      } else {
                        setFormData({ ...formData, bidAmount: isNaN(val) ? 0 : val });
                      }
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 ring-violet-500 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 italic">
                  * Ngân sách tối đa cho phép: <span className="font-bold text-violet-600">${job?.budget}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Thư giới thiệu</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tại sao bạn phù hợp với dự án này?"
                  value={formData.proposal}
                  onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
                  className="w-full p-5 bg-gray-50 rounded-2xl font-medium outline-none focus:ring-2 ring-violet-500 transition-all resize-none text-sm"
                />
              </div>

              <button
                disabled={isApplying}
                type="submit"
                className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-violet-700 transition-all shadow-xl shadow-violet-200"
              >
                {isApplying ? "Đang xử lý..." : <><Send size={18} /> Gửi đơn ứng tuyển</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}