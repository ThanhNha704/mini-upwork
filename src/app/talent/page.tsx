"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/src/utils/supabase/client";
import { Filter, ChevronDown, Loader2, X } from "lucide-react";
import Link from "next/link"

export default function FindTalentPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const supabase = createClient();

  // States cho bộ lọc và sắp xếp
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(100);
  const [sortBy, setSortBy] = useState("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const bgGradient = "bg-linear-to-r from-violet-600 to-cyan-500";

  // Hàm xử lý khi click vào kỹ năng
  const handleSkillClick = (skillName: string) => {
    if (skillName === "Tất cả") {
      setSelectedSkills([]);
      return;
    }
    setSelectedSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName]
    );
  };

  // Lấy danh sách kỹ năng
  useEffect(() => {
    const fetchSkills = async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("name")
        .order("name", { ascending: true });

      if (!error && data) {
        setSkillsList(data);
      }
    };
    fetchSkills();
  }, [supabase]);

  // Hàm fetch data freelancer
  const loadData = useCallback(async () => {
    setLoading(true);

    const hasFilter = selectedSkills.length > 0;

    // Nếu có lọc kỹ năng, dùng !inner để Supabase lọc chính xác các bản ghi có liên kết
    let selectString = hasFilter
      ? "*, freelancer_skills!inner (skills!inner (name))"
      : "*, freelancer_skills (skills (name))";

    let query = supabase
      .from("users")
      .select(selectString)
      .eq("role", "FREELANCER");

    // Lọc theo mảng kỹ năng đã chọn
    if (hasFilter) {
      query = query.in('freelancer_skills.skills.name', selectedSkills);
    }

    // Lọc theo giá
    query = query.lte('price', priceRange);

    // Sắp xếp
    if (sortBy === "price-asc") query = query.order('price', { ascending: true });
    else if (sortBy === "price-desc") query = query.order('price', { ascending: false });
    else if (sortBy === "rating") query = query.order('rating', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (!error) {
      setFreelancers(data || []);
    } else {
      console.error("Lỗi truy vấn:", error.message);
    }
    setLoading(false);
  }, [selectedSkills, priceRange, sortBy, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* NÚT MỞ BỘ LỌC CHO MOBILE*/}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 z-50 bg-violet-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold transition-transform active:scale-90"
          >
            <Filter size={20} />
            <span>Bộ lọc ({selectedSkills.length})</span>
          </button>

          {/* SIDEBAR BỘ LỌC */}
          <aside className={`
            fixed inset-y-0 left-0 z-100 w-[85%] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
            ${isFilterOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:w-1/4 lg:z-10 lg:block lg:h-fit lg:sticky lg:top-24 lg:rounded-[2.5rem] lg:border lg:border-slate-100 lg:p-8 lg:shadow-sm
          `}>
            <div className="flex lg:hidden justify-between items-center p-6 border-b">
              <span className="font-bold text-lg uppercase tracking-wider">Bộ lọc</span>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 lg:p-0 space-y-8">
              <div className="items-center gap-3 font-bold text-xl mb-6 uppercase tracking-wider text-slate-800 lg:flex hidden">
                <Filter size={20} className="text-violet-600" /> Bộ lọc
              </div>

              {/* Phần Kỹ năng */}
              <div className="space-y-4">
                <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400">Kỹ năng</h4>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  <button
                    onClick={() => handleSkillClick("Tất cả")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedSkills.length === 0
                      ? `${bgGradient} text-white shadow-md`
                      : "bg-slate-50 text-slate-500 hover:bg-violet-100 hover:text-violet-600"
                      }`}
                  >
                    Tất cả
                  </button>
                  {skillsList.map((skill) => {
                    const isActive = selectedSkills.includes(skill.name);
                    return (
                      <button
                        key={skill.name}
                        onClick={() => handleSkillClick(skill.name)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${isActive
                          ? `${bgGradient} text-white shadow-md`
                          : "bg-slate-50 text-slate-500 hover:bg-violet-100 hover:text-violet-600"
                          }`}
                      >
                        {skill.name}
                        {isActive && <X size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Thanh Mức lương */}
              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400">Lương tối đa</h4>
                  <span className="text-sm font-bold text-violet-600">${priceRange}/h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
              </div>

              <button
                onClick={() => setIsFilterOpen(false)}
                className="lg:hidden w-full py-4 bg-violet-600 text-white rounded-2xl font-bold shadow-lg mt-4"
              >
                Xem {freelancers.length} kết quả
              </button>
            </div>
          </aside>

          {/* OVERLAY MOBILE */}
          {isFilterOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-90 lg:hidden" onClick={() => setIsFilterOpen(false)} />
          )}

          {/* MAIN CONTENT */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 font-bold">Hiển thị <span className="text-slate-900">{freelancers.length}</span> chuyên gia</p>

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
                      { label: 'Giá thấp nhất', val: 'price-asc' },
                      { label: 'Giá cao nhất', val: 'price-desc' },
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
                  <div key={free.id} className="bg-white p-7 rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-50 group flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-5 mb-6">
                        <div className={`relative w-20 h-20 p-1 rounded-full ${bgGradient}`}>
                          {free.avatar_url ? (
                            <img src={free.avatar_url} alt="avatar" className="w-full h-full rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-full h-full rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold shrink-0 text-xl">
                              {free?.full_name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 group-hover:text-violet-600 transition leading-tight">{free.full_name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{free.role || "Freelancer"}</p>
                        </div>
                      </div>

                      {/* Hiển thị danh sách kỹ năng */}
                      <div className="flex flex-wrap gap-2 mb-8 min-h-15">
                        {free.freelancer_skills && free.freelancer_skills.length > 0 ? (
                          free.freelancer_skills.map((item: any, idx: number) => (
                            <span
                              key={idx}
                              className="h-max px-3 py-1 bg-violet-100 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100 uppercase group-hover:bg-violet-50 group-hover:text-violet-600 group-hover:border-violet-100 transition-colors"
                            >
                              {item.skills?.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Chưa cập nhật kỹ năng</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-5 border-t border-slate-50">
                      <div className="text-2xl font-bold text-slate-900">
                        ${free.price}<span className="text-[10px] text-slate-400 font-bold uppercase ml-1">/h</span>
                      </div>
                      <Link href={`/talent/${free.id}`}>
                        <button className={`px-6 py-3 ${bgGradient} text-white text-[10px] font-bold rounded-2xl hover:scale-105 transition-all shadow-lg uppercase`}>
                          Hồ sơ
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && freelancers.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">Không tìm thấy tài năng nào phù hợp với bộ lọc.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}