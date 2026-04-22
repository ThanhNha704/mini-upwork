"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobDetails, applyJobAction, cancelApplyAction } from "@/src/actions/jobActions";
import {
  ArrowLeft, Calendar, DollarSign, User, Star, Trash2, Send,
  MapPin, Globe, Building2, AlertCircle, X
} from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // State cho Modal báo giá
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    bidAmount: 0,
    proposal: ""
  });

  const fetchDetails = async () => {
    if (!params.id) return;
    const res = await getJobDetails(params.id as string);
    setData(res);
    // Cập nhật giá bid mặc định bằng budget của job khi load dữ liệu xong
    if (res?.job) {
      setFormData(prev => ({ ...prev, bidAmount: res.job.budget }));
    }
    setLoading(false);
  };

  useEffect(() => { fetchDetails(); }, [params.id]);

  // Xử lý Hủy hoặc Mở Modal ứng tuyển
  const handleActionClick = async () => {
    if (data?.hasApplied) {
      setShowCancelModal(true); // Mở modal xác nhận
    } else {
      setShowApplyModal(true);
    }
  };

  // 2. Hàm thực thi việc hủy (gọi khi bấm nút "Xác nhận hủy" trong Modal)
  const confirmCancel = async () => {
    setIsProcessing(true);
    setShowCancelModal(false); // Đóng modal ngay
    const res = await cancelApplyAction(data.job.id);
    if (res.success) {
      await fetchDetails();
    } else {
      alert(res.error || "Không thể hủy đơn");
    }
    setIsProcessing(false);
  };

  // Gửi báo giá thực tế
  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proposal.trim()) return alert("Vui lòng nhập thư giới thiệu");

    setIsProcessing(true);
    const res = await applyJobAction({
      jobId: data.job.id,
      bidAmount: formData.bidAmount,
      proposal: formData.proposal
    });

    if (res.success) {
      setShowApplyModal(false);
      setFormData(prev => ({ ...prev, proposal: "" }));
      await fetchDetails();
    } else {
      alert(res.error || "Có lỗi xảy ra");
    }
    setIsProcessing(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 font-medium italic">Đang đồng bộ dữ liệu...</div>;
  if (!data?.job) return <div className="min-h-screen flex items-center justify-center">Dự án không tồn tại.</div>;

  const { job, client, hasApplied } = data;
  const profile = Array.isArray(client?.client_profiles) ? client.client_profiles[0] : client?.client_profiles;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header Section */}
      <div className="bg-linear-to-br from-indigo-600 via-violet-600 to-cyan-500 pt-10 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-all font-bold text-sm uppercase tracking-wider">
            <ArrowLeft size={18} /> Quay lại
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight max-w-2xl">{job.title}</h1>
            <div className="bg-white/10 p-6 rounded-3xl border border-white/20 text-white min-w-50 text-center">
              <p className="text-xs font-bold opacity-70 uppercase mb-1">Ngân sách dự kiến</p>
              <p className="text-4xl font-bold">${job.budget}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 p-8 md:p-10 border border-gray-100">
              <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-50">
                <div className="flex items-center gap-4">
                  <span className="px-5 py-2 bg-green-50 text-green-600 rounded-2xl text-xs font-bold uppercase tracking-widest">{job.status}</span>
                  <span className="text-gray-400 text-xs font-bold flex items-center gap-1.5 uppercase">
                    <Calendar size={14} /> {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <button
                  onClick={handleActionClick}
                  disabled={isProcessing}
                  className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all text-sm shadow-lg ${hasApplied ? "bg-red-50 text-red-500 hover:bg-red-100 shadow-red-100" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                    }`}
                >
                  {isProcessing ? "..." : hasApplied ? <><Trash2 size={18} /> HỦY ỨNG TUYỂN</> : <><Send size={18} /> GỬI BÁO GIÁ</>}
                </button>
              </div>

              <section className="mb-12">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span> MÔ TẢ DỰ ÁN
                </h3>
                <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap font-medium">{job.description}</div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-[0.2em]">Kỹ năng yêu cầu</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills?.map((s: any) => (
                    <span key={s.id} className="px-5 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold border border-gray-100">{s.name}</span>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Customer Profile Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 p-8 border border-gray-100 sticky top-6">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8 text-center">Hồ sơ khách hàng</h4>
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-linear-to-tr from-indigo-50 to-white rounded-full flex items-center justify-center text-indigo-600 mb-4 border-4 border-white shadow-inner overflow-hidden">
                  {client?.avatar_url ? <img src={client.avatar_url} className="w-full h-full object-cover" alt="avatar" /> : <User size={40} />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{client?.full_name || "Khách hàng"}</h3>
                {profile?.company_name && (
                  <p className="text-sm font-bold text-indigo-600 mb-4 flex items-center gap-1.5">
                    <Building2 size={14} /> {profile.company_name}
                  </p>
                )}
                {/* ... (Các thông tin khách hàng khác giữ nguyên như file của bạn) */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL GỬI BÁO GIÁ */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowApplyModal(false)} />
          <form
            onSubmit={submitApplication}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 uppercase italic">Gửi đơn ứng tuyển</h2>
              <button type="button" onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Giá thầu của bạn ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    required
                    value={formData.bidAmount}
                    onChange={(e) => setFormData({ ...formData, bidAmount: parseInt(e.target.value) })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Thư giới thiệu (Proposal)</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Mô tả kinh nghiệm và cách bạn sẽ hoàn thành dự án này..."
                  value={formData.proposal}
                  onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
                  className="w-full p-5 bg-gray-50 rounded-2xl font-medium outline-none focus:ring-2 ring-indigo-500 transition-all resize-none text-sm"
                />
              </div>

              <button
                disabled={isProcessing}
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
              >
                {isProcessing ? "Đang gửi..." : <><Send size={18} /> XÁC NHẬN ỨNG TUYỂN</>}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* MODAL XÁC NHẬN HỦY ỨNG TUYỂN */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowCancelModal(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                <AlertCircle size={32} />
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">Hủy ứng tuyển?</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Bạn có chắc chắn muốn rút lại báo giá cho dự án
              <span className="font-bold text-indigo-600"> "{data.job.title}"</span>?
              Hành động này không thể hoàn tác.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                Để tôi nghĩ lại
              </button>
              <button
                onClick={confirmCancel}
                disabled={isProcessing}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
              >
                {isProcessing ? "Đang xử lý..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}