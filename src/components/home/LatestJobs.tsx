import { Clock, DollarSign, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const LatestJobs = ({ items }: { items: any[] }) => {
  return (
    <section className="py-12">
      <div className="grid grid-rows-2 md:flex justify-between items-center md:items-end md:mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 uppercase tracking-tighter">
            Dự án mới đăng
          </h2>
          <p className="text-gray-500 font-medium mt-2 italic">Những cơ hội việc làm mới nhất dành cho bạn</p>
        </div>
        <Link href="/jobs" className="text-sm font-bold text-violet-600 hover:underline flex items-center gap-1">
          Xem tất cả dự án <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="pb-10 flex overflow-y-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.length > 0 ? (
          items.map((job) => (
            <div
              key={job.id}
              className="min-w-50 bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-5">
                  <span className="px-3 py-1 bg-violet-50 text-violet-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-violet-100">
                    Mới
                  </span>
                  {/* Ngân sách */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900 leading-none">${job.budget}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Ngân sách</p>
                  </div>
                </div>
                {/* Tên job */}
                <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-4 group-hover:text-violet-600 transition-colors">
                  {job.title}
                </h3>
                {/* Mô tả */}
                <p className="text-gray-400 text-xs line-clamp-3 mb-6 italic leading-relaxed">
                  {job.description}
                </p>
              </div>
              {/* avt client */}
              <div className="w-full pt-5 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between space-y-5">
                <div className="flex items-center gap-2">
                  <img
                    src={job.client?.avatar_url || `https://ui-avatars.com/api/?name=${job.client?.full_name}`}
                    className="w-8 h-8 rounded-xl object-cover border border-slate-100"
                    alt="client"
                  />
                  <div>
                    <p className="text-[10px] font-bold text-slate-800 leading-none">{job.client?.full_name}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1">
                      <Clock size={8} /> {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/jobs/${job.id}`}
                  className="w-full md:w-8 h-8 bg-linear-to-r from-violet-600 to-cyan-500 text-white rounded-xl flex items-center justify-center hover:opacity-90"
                >
                  <span className="hidden md:flex">
                    <ArrowUpRight size={14} />
                  </span>
                  <span className="text-sm md:hidden">
                    Chi tiết
                  </span>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-gray-400 italic">
            Hiện chưa có dự án nào mới.
          </div>
        )}
      </div>
    </section>
  );
};