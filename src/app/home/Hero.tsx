import { MoveRight } from "lucide-react";

export const Hero = () => (
  <div className="w-full min-h-screen  text-white px-12 py-20 flex items-center justify-center">
    <div className="max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Cột bên trái: Nội dung chữ */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Tìm kiếm Freelancer hoàn hảo cho dự án của bạn
          </h1>
          <p className="text-xl opacity-90 leading-relaxed">
            Kết nối với hàng nghìn chuyên gia tài năng sẵn sàng biến ý tưởng của bạn thành hiện thực.
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-violet-600 px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition flex items-center gap-2">
              Bắt đầu ngay <MoveRight size={20} />
            </button>
          </div>
        </div>

        {/* Cột bên phải: Ảnh minh họa */}
        <div className="hidden md:block relative h-125">
          <img 
            src="https://images.unsplash.com/photo-1628763448616-5d81ad40b1fc"
            alt="Freelancer làm việc" 
            className="w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-white/10"
          />
        </div>

      </div>
    </div>
  </div>
);