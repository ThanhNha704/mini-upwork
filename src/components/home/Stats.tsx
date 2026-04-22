import { Briefcase, Users, CheckCircle } from "lucide-react";

export const Stats = ({ data }: { data: any }) => {
  const stats = [
    { 
      label: "Dự án đang chờ", 
      value: data?.total_jobs || 0, 
      icon: Briefcase, // Truyền trực tiếp Component, không dùng < />
    },
    { 
      label: "Freelancers", 
      value: data?.total_freelancers || 0, 
      icon: Users,
    },
    { 
      label: "Dự án hoàn tất", 
      value: data?.completed_projects || 0, 
      icon: CheckCircle,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 mt-12 relative z-10">
      <div className="bg-white p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[3rem] border border-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon; // Gán vào biến viết hoa để dùng như Component
            
            return (
              <div key={index} className="flex flex-col items-center text-center group">
                {/* Icon Box với Gradient đồng bộ Hero */}
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-600 to-cyan-400 flex items-center justify-center mb-6 shadow-lg shadow-violet-100 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-7 h-7 text-white" />
                </div>

                {/* Số liệu với Gradient Text */}
                <h3 className="text-4xl font-bold bg-linear-to-br from-violet-600 to-cyan-500 bg-clip-text text-transparent tracking-tighter">
                  {stat.value?.toLocaleString()}+
                </h3>

                {/* Label chuyên nghiệp */}
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-3">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};