"use client";

import React, { useEffect, useState } from "react";
import { Briefcase, CheckCircle, Clock, DollarSign, Loader2 } from "lucide-react";
import { getFreelancerStats } from "@/src/actions/freelancerActions";

export default function FreelancerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const stats = await getFreelancerStats();
      setData(stats);
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  const statsCards = [
    {
      label: "Việc đã apply",
      value: data?.applied || 0,
      icon: Briefcase,
      color: "text-blue-600"
    },
    {
      label: "Đang thực hiện",
      value: data?.inProgress || 0,
      icon: Clock,
      color: "text-amber-600"
    },
    {
      label: "Đã hoàn thành",
      value: data?.completed || 0,
      icon: CheckCircle,
      color: "text-emerald-600"
    },
    {
      label: "Số dư ví",
      value: `$${(data?.balance || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-violet-600"
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tighter">
          Chào buổi sáng, {data?.name.split(' ').pop()}!
        </h1>
        <p className="text-slate-500 font-medium">Đây là tóm tắt hoạt động của bạn trên hệ thống.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${stat.color} mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}