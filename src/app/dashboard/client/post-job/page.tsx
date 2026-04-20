"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { createJobAction } from "@/src/actions/jobActions";
import { fetchAllAvailableSkills } from "@/src/actions/skillActions";
import { createClient } from "@/src/utils/supabase/client";

export default function PostJob() {
  const router = useRouter();
  const supabase = createClient();

  // States UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // States Kỹ năng
  const [searchTerm, setSearchTerm] = useState("");
  const [allSkills, setAllSkills] = useState<any[]>([]); // Toàn bộ skill từ DB
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<any[]>([]);

  // State Form
  const [formData, setFormData] = useState({
    title: "",
    budget: "",
    description: "",
  });

  // 1. Load danh sách skill khi component mount
  useEffect(() => {
    async function loadSkills() {
      const skills = await fetchAllAvailableSkills(supabase);
      setAllSkills(skills);
    }
    loadSkills();
  }, []);

  // 2. Logic Tìm kiếm
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      const filtered = allSkills.filter(
        (s) =>
          s.name.toLowerCase().includes(value.toLowerCase()) &&
          !selectedSkills.some((selected) => selected.id === s.id)
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  // 3. Thêm/Xóa kỹ năng
  const addSkill = (skill: any) => {
    setSelectedSkills((prev) => [...prev, skill]);
    setSearchTerm("");
    setSuggestions([]);
  };

  const removeSkill = (skillId: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s.id !== skillId));
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkills.length === 0) {
      setError("Vui lòng chọn ít nhất một kỹ năng yêu cầu.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await createJobAction({
      ...formData,
      budget: Number(formData.budget),
      skillIds: selectedSkills.map((s) => s.id),
    });

    console.log("data: ", formData);
    console.log("skill: ", selectedSkills);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Bạn cần đăng nhập" };
  console.log("iduser: ", user)

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/client/manage-jobs"), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-3xl font-bold text-center text-slate-900">Đăng dự án mới</h2>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            <AlertCircle size={20} className="shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700">
            <CheckCircle size={20} className="shrink-0" />
            <p className="font-medium">Đăng bài thành công! Đang chuyển hướng...</p>
          </div>
        )}

        {/* Tiêu đề */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Tiêu đề dự án</label>
          <input
            type="text"
            required
            disabled={loading || success}
            className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition disabled:bg-slate-50"
            placeholder="Ví dụ: Thiết kế Website bán hàng Next.js"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* Ngân sách */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Ngân sách dự kiến ($)</label>
          <input
            type="number"
            required
            min="1"
            disabled={loading || success}
            className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition"
            placeholder="Nhập số tiền..."
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />
        </div>

        {/* Skills Selector */}
        <div className="space-y-2 relative">
          <label className="text-sm font-semibold text-slate-700">Kỹ năng yêu cầu</label>
          
          {/* List Skill đã chọn */}
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedSkills.map((skill) => (
              <span key={skill.id} className="px-4 py-1.5 bg-violet-50 text-violet-600 rounded-full text-sm font-semibold flex items-center gap-2 border border-violet-100">
                {skill.name}
                <button 
                  type="button" 
                  onClick={() => removeSkill(skill.id)} 
                  className="hover:text-rose-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          {/* Input Search */}
          <div className="relative">
            <input
              type="text"
              disabled={loading || success}
              className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-400 outline-none transition"
              placeholder="Gõ để tìm kiếm kỹ năng..."
              value={searchTerm}
              onChange={handleSearch}
            />
            
            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="w-full p-4 hover:bg-violet-50 text-left flex justify-between items-center border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <span className="font-medium text-slate-700">{s.name}</span>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{s.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mô tả chi tiết */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Mô tả công việc</label>
          <textarea
            required
            disabled={loading || success}
            className="w-full p-4 border border-slate-200 rounded-2xl h-40 focus:ring-2 focus:ring-violet-500 outline-none transition resize-none"
            placeholder="Mô tả các yêu cầu, mục tiêu dự án..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-linear-to-r from-violet-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> 
              Đang xử lý...
            </>
          ) : (
            "Đăng bài dự án"
          )}
        </button>
      </form>
    </div>
  );
}