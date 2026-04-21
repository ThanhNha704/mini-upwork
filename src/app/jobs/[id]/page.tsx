"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobDetails, applyJobAction, cancelApplyAction } from "@/src/actions/jobActions";
import { ArrowLeft, Calendar, DollarSign, User, Star, Trash2, Send, MapPin, Globe, Building2, Users, Mail, Info, ShieldCheck, Landmark } from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDetails = async () => {
    if (!params.id) return;
    const res = await getJobDetails(params.id as string);
    setData(res);
    setLoading(false);
  };

  useEffect(() => { fetchDetails(); }, [params.id]);

  const handleToggleApply = async () => {
    setIsProcessing(true);
    if (data?.hasApplied) {
      const res = await cancelApplyAction(data.job.id);
      if (res.success) await fetchDetails();
    } else {
      const res = await applyJobAction({ 
        jobId: data.job.id, 
        bidAmount: data.job.budget, 
        proposal: "Tôi tự tin hoàn thành tốt dự án này." 
      });
      if (res.success) await fetchDetails();
    }
    setIsProcessing(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 font-medium italic">Đang đồng bộ dữ liệu...</div>;
  if (!data?.job) return <div className="min-h-screen flex items-center justify-center">Dự án không tồn tại.</div>;

  const { job, client, hasApplied } = data;
  
  // Supabase trả về client_profiles dạng mảng nếu join 1-n, 
  // lấy phần tử đầu tiên nếu là quan hệ 1-1
  const profile = Array.isArray(client?.client_profiles) 
    ? client.client_profiles[0] 
    : client?.client_profiles;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-linear-to-br from-indigo-600 via-violet-600 to-cyan-500 pt-10 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-all font-bold text-sm uppercase tracking-wider">
            <ArrowLeft size={18} /> Quay lại
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight max-w-2xl">{job.title}</h1>
            <div className="bg-white/10 p-6 rounded-3xl border border-white/20 text-white min-w-50 text-center">
              <p className="text-xs font-bold opacity-70 uppercase mb-1">Ngân sách</p>
              <p className="text-4xl font-bold">${job.budget}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: CHI TIẾT CÔNG VIỆC */}
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
                  onClick={handleToggleApply}
                  disabled={isProcessing}
                  className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all text-sm shadow-lg ${
                    hasApplied ? "bg-red-50 text-red-500 hover:bg-red-100 shadow-red-100" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                  }`}
                >
                  {isProcessing ? "..." : hasApplied ? <><Trash2 size={18}/> HỦY ỨNG TUYỂN</> : <><Send size={18}/> ỨNG TUYỂN</>}
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

          {/* CỘT PHẢI: TẤT CẢ THÔNG TIN KHÁCH HÀNG */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 p-8 border border-gray-100 sticky top-6">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8 text-center">Hồ sơ khách hàng</h4>
              
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-linear-to-tr from-indigo-50 to-white rounded-full flex items-center justify-center text-indigo-600 mb-4 border-4 border-white shadow-inner overflow-hidden">
                  {client?.avatar_url ? <img src={client.avatar_url} className="w-full h-full object-cover" alt="avatar"/> : <User size={40} />}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">{client?.full_name || "Khách hàng"}</h3>
                
                {/* Thông tin Company */}
                {profile?.company_name && (
                  <p className="text-sm font-bold text-indigo-600 mb-4 flex items-center gap-1.5">
                    <Building2 size={14} /> {profile.company_name}
                  </p>
                )}

                <div className="flex items-center text-yellow-400 mb-6 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                  <Star size={14} fill="currentColor" />
                  <span className="text-yellow-700 text-xs font-bold ml-1.5">5.0 / 5.0</span>
                </div>

                {/* Danh sách thông tin chi tiết */}
                <div className="w-full space-y-5 pt-6 border-t border-gray-50">
                  
                  {client?.bio && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Giới thiệu</p>
                      <p className="text-xs text-gray-600 italic leading-relaxed">{client.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><Mail size={16} /></div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Email liên hệ</p>
                        <p className="text-xs font-medium text-gray-800 break-all">{client?.email}</p>
                      </div>
                    </div>

                    {profile?.location && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><MapPin size={16} /></div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Địa điểm</p>
                          <p className="text-xs font-medium text-gray-800">{profile.location}</p>
                        </div>
                      </div>
                    )}

                    {profile?.industry && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><Landmark size={16} /></div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Lĩnh vực</p>
                          <p className="text-xs font-medium text-gray-800">{profile.industry}</p>
                        </div>
                      </div>
                    )}

                    {profile?.website && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><Globe size={16} /></div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Website</p>
                          <a href={profile.website} target="_blank" className="text-xs font-bold text-indigo-600 hover:underline">Đi đến trang web</a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><Users size={16} /></div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Quy mô công ty</p>
                        <p className="text-xs font-medium text-gray-800">{profile?.company_size || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Xác thực tài khoản</span>
                      {profile?.payment_verified ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                          <ShieldCheck size={12} /> VERIFIED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">UNVERIFIED</span>
                      )}
                    </div>
                    
                    {client?.price > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Ngân sách tb / giờ</span>
                        <span className="text-sm font-black text-gray-900">${client.price}/hr</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}