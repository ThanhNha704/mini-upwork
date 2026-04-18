import { Users, CheckCircle, TrendingUp, DollarSign } from "lucide-react";

const stats = [
  { icon: Users, value: "50 nghìn+", label: "Những người làm việc tự do tích cực", color: "bg-pink-100 text-pink-600" },
  { icon: CheckCircle, value: "200 nghìn+", label: "Công việc đã hoàn thành", color: "bg-purple-100 text-purple-600" },
  { icon: TrendingUp, value: "98%", label: "Sự hài lòng của khách hàng", color: "bg-fuchsia-100 text-fuchsia-600" },
  { icon: DollarSign, value: "100 triệu đô la +", label: "Tổng thu nhập", color: "bg-rose-100 text-rose-600" },
];

export const Stats = () => (
  <div className="max-w-7xl mx-auto px-6 py-12 shadow-lg rounded-lg bg-white">
    <div className="mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <div key={index} className="flex flex-col items-center text-center space-y-3">
          <div className={`p-3 rounded-xl bg-linear-to-br from-violet-600 to-cyan-400`}>
            <stat.icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold bg-linear-to-br from-violet-600 to-cyan-400 bg-clip-text text-transparent">
            {stat.value}
          </h3>
          <p className="text-sm text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
);