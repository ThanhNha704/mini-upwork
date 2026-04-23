import { Star, MapPin, CheckCircle, MoveRight, User } from "lucide-react";
import Link from "next/link";

export const FeaturedFreelancers = ({ list }: { list: any[] }) => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Tiêu đề, Nút Điều hướng */}
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-5">
          <div>
            <h2 className="text-4xl font-bold text-[#1E1B4B] mb-3 uppercase tracking-tighter">
              Freelancer Nổi bật
            </h2>
            <p className="text-gray-500 text-lg font-medium italic">
              Những chuyên gia hàng đầu sẵn sàng đồng hành cùng dự án của bạn
            </p>
          </div>
          <Link 
            href="/talent" 
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-br from-violet-600 to-cyan-400 text-white rounded-2xl font-bold hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            Khám phá thêm <MoveRight size={20} />
          </Link>
        </div>

        {/* Lưới Freelancer Cards */}
        <div className="pb-10 flex overflow-y-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {list && list.length > 0 ? (
            list.map((free, index) => (
              <div 
                key={free.id || index} 
                className="bg-white p-6 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-violet-200 transition-all duration-500 border border-gray-100 group flex flex-col justify-between"
              >
                <div>
                  {/* Header: Avatar & Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-16 h-16 p-1 rounded-2xl bg-linear-to-br from-violet-600 to-cyan-400 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                      {free.avatar_url ? (
                        <img 
                          src={free.avatar_url} 
                          alt={free.full_name} 
                          className="w-full h-full rounded-xl object-cover border-2 border-white" 
                        />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-violet-600 border-2 border-white">
                          <User size={24} />
                        </div>
                      )}
                      {/* <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div> */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{free.full_name}</h3>
                      <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">
                        Freelancer
                      </p>
                    </div>
                  </div>

                  {/* Bio ngắn gọn */}
                  <p className="text-gray-500 text-xs leading-relaxed mb-6 line-clamp-3 italic">
                    {free.bio || "Chưa có tiểu sử giới thiệu. Liên hệ để biết thêm chi tiết về kinh nghiệm làm việc."}
                  </p>
                </div>

                <div>
                  {/* Footer Card: Giá & Button */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                    <div>
                      <span className="text-xl font-bold bg-linear-to-br from-violet-600 to-cyan-500 bg-clip-text text-transparent">
                        ${free.price || 0}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">/giờ</span>
                    </div>
                    <button className="px-5 py-2.5 bg-linear-to-r from-violet-600 to-cyan-500 text-white text-[10px] font-bold rounded-xl hover:opacity-90 uppercase tracking-widest">
                      Hồ sơ
                    </button>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-white">
               <p className="text-gray-400 font-medium">Đang tìm kiếm các gương mặt nổi bật...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};