"use client";

import { useEffect, useState } from "react";
import { getFreelancerApplications } from "@/src/actions/jobActions";
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  DollarSign,
  Coins,
} from "lucide-react";
import Link from "next/link";

export default function FreelancerApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const data = await getFreelancerApplications();
        setApplications(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, []);

  // Hàm render Badge trạng thái ứng tuyển
  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string; icon: any }> = {
      PENDING: { 
        label: "Đang chờ", 
        class: "bg-amber-50 text-amber-700 border-amber-200", 
        icon: <Clock size={14} /> 
      },
      ACCEPTED: { 
        label: "Được nhận", 
        class: "bg-emerald-50 text-emerald-700 border-emerald-200", 
        icon: <CheckCircle2 size={14} /> 
      },
      REJECTED: { 
        label: "Từ chối", 
        class: "bg-red-50 text-red-700 border-red-200", 
        icon: <XCircle size={14} /> 
      },
    };

    const config = statusMap[status] || statusMap.PENDING;
    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase ${config.class}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium italic">Đang tải danh sách ứng tuyển...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">Việc đã apply</h1>
        <p className="text-gray-500 mt-1 font-medium">Theo dõi trạng thái các dự án bạn đã gửi báo giá.</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-gray-300" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Bạn chưa ứng tuyển việc nào</h3>
          <p className="text-gray-500 mb-6">Hãy khám phá các dự án mới để bắt đầu thu nhập.</p>
          <Link 
            href="/jobs" 
            className="inline-flex items-center bg-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-100"
          >
            Tìm việc ngay
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div 
              key={app.id} 
              className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:shadow-gray-200/50 transition-all flex flex-col md:flex-row items-center gap-6"
            >
              {/* Thông tin Client */}
              <div className="flex items-center gap-4 min-w-50">
                <img 
                  src={app.job?.client?.avatar_url || "https://ui-avatars.com/api/?name=Client"} 
                  alt="client"
                  className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Khách hàng</p>
                  <p className="font-bold text-gray-900 leading-tight">{app.job?.client?.full_name}</p>
                </div>
              </div>

              {/* Thông tin Job */}
              <div className="flex-1 border-l border-gray-100 pl-6">
                <Link href={`/jobs/${app.job?.id}`} className="hover:text-violet-600 transition-colors">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{app.job?.title}</h3>
                </Link>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    <Coins size={14} />
                    Giá đề xuất: ${app.bidAmount}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    Nộp ngày: {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* Trạng thái & Link */}
              <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                <div className="flex-1 flex justify-end">
                  {renderStatusBadge(app.status)}
                </div>
                <Link 
                  href={`/jobs/${app.job?.id}`}
                  className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-all"
                >
                  <ChevronRight size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}