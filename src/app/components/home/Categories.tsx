import { Code, Palette, PenTool, Video, Megaphone, BarChart } from "lucide-react";

const categories = [
  // Sử dụng các dải Gradient từ Xanh sang Tím theo các sắc độ khác nhau
  { title: "Phát triển Web", count: "12,534 freelancers", icon: Code, color: "bg-gradient-to-br from-blue-600 to-violet-600" }, 
  { title: "Thiết kế & Sáng tạo", count: "8,921 freelancers", icon: Palette, color: "bg-gradient-to-br from-violet-500 to-fuchsia-500" }, 
  { title: "Viết lách & Dịch thuật", count: "6,783 freelancers", icon: PenTool, color: "bg-gradient-to-br from-indigo-500 to-blue-500" }, 
  { title: "Video & Hoạt họa", count: "5,432 freelancers", icon: Video, color: "bg-gradient-to-br from-cyan-500 to-blue-600" }, 
  { title: "Marketing", count: "7,654 freelancers", icon: Megaphone, color: "bg-gradient-to-br from-blue-500 to-indigo-600" }, 
  { title: "Dữ liệu & Phân tích", count: "4,321 freelancers", icon: BarChart, color: "bg-gradient-to-br from-violet-600 to-indigo-700" }, 
];

export const Categories = () => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Tiêu đề phần */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">Khám phá theo danh mục</h2>
          <p className="text-gray-500">Tìm kiếm chuyên gia trong mọi lĩnh vực</p>
        </div>

        {/* Lưới danh mục */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Tăng gap lên 6 để thoáng hơn */}
          {categories.map((cat, index) => (
            <div 
              key={index}
              className={`${cat.color} p-8 rounded-4xl text-white cursor-pointer hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 shadow-lg flex flex-col justify-between min-h-52`}
            >
              {/* Icon Box */}
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <cat.icon size={24} />
              </div>

              {/* Nội dung chữ */}
              <div>
                <h3 className="text-xl font-bold mb-1 tracking-wide">{cat.title}</h3>
                <p className="text-white/80 text-sm font-medium">{cat.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};