"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/src/utils/supabase/client";
import { Search, MapPin, CheckCircle, Star, Filter, ChevronDown, Loader2 } from "lucide-react";

export default function FindTalentPage() {
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // States cho bộ lọc và sắp xếp
  const [selectedSkill, setSelectedSkill] = useState("Tất cả");
  const [priceRange, setPriceRange] = useState(100);
  const [sortBy, setSortBy] = useState("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const bgGradient = "bg-linear-to-r from-violet-600 to-cyan-500";

  // Hàm fetch chính - Dùng useCallback để tránh tạo lại hàm liên tục
  const loadData = useCallback(async () => {
    setLoading(true);
    // Cấu trúc truy vấn với join bảng skills
    let selectString = "*, freelancer_skills (skills (name))";
    // Nếu có filter kỹ năng, ta cần join inner để chỉ lấy freelancer có kỹ năng đó
    if (selectedSkill !== "Tất cả") {
      selectString = "*, freelancer_skills!inner (skills!inner (name))";
    }
    let query = supabase
      .from("users")
      .select(selectString)
      .eq("role", "FREELANCER");

    // 2. Lọc theo Kỹ năng (SỬA Ở ĐÂY)
    if (selectedSkill !== "Tất cả") {
      query = query.eq('freelancer_skills.skills.name', selectedSkill);
    }
    query = query.lte('price', priceRange);

    // 4. Sắp xếp
    if (sortBy === "price-asc") query = query.order('price', { ascending: true });
    else if (sortBy === "price-desc") query = query.order('price', { ascending: false });
    else if (sortBy === "rating") query = query.order('rating', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    console.log("Executed query:", query);
    console.log("Query result:", data, "Error:", error);
    console.log("Applied filters - Skill:", selectedSkill, "Price Range:", priceRange, "Sort By:", sortBy);

    if (!error) {
      setFreelancers(data || []);
    } else {
      console.error("Lỗi truy vấn:", error.message);
    }
    setLoading(false);
  }, [selectedSkill, priceRange, sortBy, supabase]);

  // Gọi hàm loadData mỗi khi bộ lọc thay đổi
  useEffect(() => {
    loadData();
  }, [loadData]);


  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      {/* 1. HERO SECTION */}
      <div className={`w-full h-64 ${bgGradient} flex flex-col items-center justify-center text-white px-4 text-center`}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight uppercase">Tìm kiếm tài năng</h1>
        <p className="text-lg opacity-90 font-medium max-w-2xl">Kết nối với những chuyên gia hàng đầu để bứt phá dự án</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* 2. SIDEBAR BỘ LỌC */}
          <aside className="w-full lg:w-1/4 space-y-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-fit sticky top-24">
            <div className="flex items-center gap-3 font-bold text-xl mb-6 uppercase tracking-wider text-slate-800">
              <Filter size={20} className="text-violet-600" /> Bộ lọc
            </div>

            {/* Kỹ năng */}
            <div className="space-y-4">
              <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400">Kỹ năng</h4>
              <div className="flex flex-wrap gap-2">
                {["Tất cả", "React", "Figma", "Node.js", "Tailwind"].map((skill) => (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(skill)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedSkill === skill
                      ? `${bgGradient} text-white border-transparent shadow-md`
                      : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-violet-100 hover:text-violet-600"
                      }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* THANH MỨC LƯƠNG (Đã hoạt động) */}
            <div className="space-y-6 pt-6 border-t border-slate-50">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400">Mức lương tối đa</h4>
                <span className="text-sm font-bold text-violet-600">${priceRange}/h</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="5"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-violet-600 hover:accent-cyan-500 transition-all"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>$20</span>
                <span>$200</span>
              </div>
            </div>
          </aside>

          {/* 3. DANH SÁCH FREELANCER */}
          <main className="flex-1">
            {/* Thanh Sort & Info */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 font-bold">Hiển thị <span className="text-slate-900 font-bold">{freelancers.length}</span> kết quả</p>

              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-widest hover:text-violet-600 transition"
                >
                  Sắp xếp: {sortBy === 'newest' ? 'Mới nhất' : sortBy === 'price-asc' ? 'Giá thấp' : sortBy === 'price-desc' ? 'Giá cao' : 'Đánh giá'}
                  <ChevronDown size={16} />
                </button>

                {showSortMenu && (
                  <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-20">
                    {[
                      { label: 'Mới nhất', val: 'newest' },
                      { label: 'Giá: Thấp đến Cao', val: 'price-asc' },
                      { label: 'Giá: Cao đến Thấp', val: 'price-desc' },
                      { label: 'Đánh giá cao nhất', val: 'rating' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => { setSortBy(item.val); setShowSortMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-violet-50 hover:text-violet-600 rounded-xl transition"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-32"><Loader2 className="animate-spin text-violet-600" size={40} /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {freelancers.map((free) => (
                  <div key={free.id} className="bg-white p-7 rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-50 group">
                    <div className="flex items-center gap-5 mb-6">
                      <div className={`relative w-20 h-20 p-1 rounded-full ${bgGradient}`}>
                        {free.avatar_url ? (
                          <img src={free.avatar_url} alt="avatar" className="w-full h-full rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold shrink-0">
                            {free?.full_name?.charAt(0).toUpperCase()}
                          </div>
                        )}                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-violet-600 transition leading-tight">{free.full_name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{free.role || "Freelancer"}</p>
                        {/* <div className="flex items-center gap-1 mt-2">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-slate-900">{free.rating}</span>
                        </div> */}
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex justify-between items-center pt-5 border-t border-slate-50">
                      <div className="text-2xl font-bold text-slate-900">
                        ${free.price}<span className="text-[10px] text-slate-400 font-bold uppercase ml-1">/h</span>
                      </div>
                      <button className={`px-6 py-3 ${bgGradient} text-white text-[10px] font-bold rounded-2xl hover:scale-105 transition-all shadow-lg uppercase`}>
                        Hồ sơ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}