import { Briefcase, CheckCircle, Clock, DollarSign } from "lucide-react";

export default function FreelancerDashboard() {

  const stats = [
    { label: "Việc đã apply", value: "12", icon: <Briefcase />, color: "text-blue-600" },
    { label: "Đang thực hiện", value: "03", icon: <Clock />, color: "text-amber-600" },
    { label: "Đã hoàn thành", value: "45", icon: <CheckCircle />, color: "text-emerald-600" },
    { label: "Tổng thu nhập", value: "$2,400", icon: <DollarSign />, color: "text-violet-600" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Chào buổi sáng, Freelancer!</h1>
        <p className="text-slate-500">Đây là tóm tắt hoạt động của bạn trong tuần này.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${stat.color} mb-4`}>
              {stat.icon}
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Placeholder cho Job gợi ý hoặc Hoạt động gần đây */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold mb-4">Hoạt động gần đây</h3>
        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
          <p className="text-slate-400">Chưa có hoạt động nào để hiển thị.</p>
        </div>
      </div>
    </div>
  );
}