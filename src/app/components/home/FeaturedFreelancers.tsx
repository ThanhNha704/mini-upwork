import { Star, MapPin, CheckCircle, MoveRight } from "lucide-react";

const freelancers = [
  {
    name: "Sarah Johnson",
    role: "Lập trình viên Full Stack",
    rating: 4.9,
    reviews: 127,
    location: "San Francisco, US",
    jobs: 156,
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    price: 85,
    avatar: "https://i.pravatar.cc/150?u=sarah",
  },
  // Thêm các freelancer khác tương tự ở đây...
];
export const FeaturedFreelancers = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Tiêu đề & Nút Xem tất cả */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold text-[#1E1B4B] mb-3">Freelancer Nổi bật</h2>
            <p className="text-gray-500 text-lg">Những chuyên gia hàng đầu sẵn sàng làm việc</p>
          </div>
          <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-linear-to-br from-violet-600 to-cyan-400 text-white rounded-2xl font-bold hover:shadow-lg transition">
            Xem tất cả <MoveRight size={20} />
          </button>
        </div>

        {/* Lưới Freelancer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {freelancers.map((free, index) => (
            <div key={index} className="bg-white p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              
              {/* Header: Avatar & Thông tin cơ bản */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 p-1 rounded-full bg-linear-to-br from-violet-600 to-cyan-400">
                  <img src={free.avatar} alt={free.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{free.name}</h3>
                  <p className="text-xs text-gray-500">{free.role}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold">{free.rating}</span>
                    <span className="text-xs text-gray-400">({free.reviews})</span>
                  </div>
                </div>
              </div>

              {/* Chi tiết: Địa điểm & Số job */}
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={14} /> {free.location}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle size={14} className="text-green-500" /> {free.jobs} công việc đã làm
                </div>
              </div>

              {/* Skills (Badges) */}
              <div className="flex flex-wrap gap-2 mb-8 h-17.5 overflow-hidden">
                {free.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium group-hover:bg-purple-50 group-hover:text-[#4F46E5] transition">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Footer Card: Giá & Nút Xem hồ sơ */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div>
                  <span className="text-lg font-bold text-violet-400">${free.price}</span>
                  <span className="text-xs text-gray-400">/giờ</span>
                </div>
                <button className="px-4 py-2 bg-linear-to-r from-violet-600 to-cyan-400 text-white text-xs font-bold rounded-xl hover:opacity-90 transition">
                  Xem hồ sơ
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};