"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/src/utils/supabase/client";
import { fetchAllAvailableSkills, filterSkills, updateFreelancerSkills } from "@/src/actions/skillActions";

export default function FreelancerProfile() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // States cho Search Kỹ năng
  const [allSkills, setAllSkills] = useState<any[]>([]); // Danh sách mẫu từ DB
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [data, setData] = useState({
    fullName: "",
    bio: "",
    email: "",
    role: "FREELANCER",
    price: 0,
    skills: [] as any[],
    preferredSkills: [] as any[]
  });

  const bgGradient = "bg-linear-to-r from-violet-600 to-cyan-500";

  // 1. Load Profile và Pool Skills
useEffect(() => {
  async function initData() {
    setLoading(true);
    try {
      // 1. Kiểm tra session người dùng
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;

      // 2. Chạy song song các request để tối ưu tốc độ (Parallel Fetching)
      const [skillsPool, profileRes] = await Promise.all([
        fetchAllAvailableSkills(supabase),
        supabase
          .from('users')
          .select(`
            full_name, avatar_url, bio, email, role, price,
            freelancer_skills (
              skills ( id, name )
            )
          `)
          .eq('id', user.id)
          .single()
      ]);

      // 3. Set danh sách gợi ý kỹ năng
      setAllSkills(skillsPool || []);

      // 4. Xử lý dữ liệu User
      const { data: res, error: fetchError } = profileRes;
      
      if (fetchError) {
        console.error("Lỗi fetch profile:", fetchError.message);
        return;
      }

      if (res) {
        // Xử lý làm phẳng danh sách skills từ bảng trung gian
        // Kết quả sẽ là mảng các object: [{id: '...', name: '...'}, ...]
        const flattenedSkills = res.freelancer_skills
          ? res.freelancer_skills
              .map((item: any) => item.skills)
              .filter((s: any) => s !== null)
          : [];

        setData({
          fullName: res.full_name || '',
          bio: res.bio || '',
          email: res.email || '',
          role: res.role || 'FREELANCER',
          price: Number(res.price) || 0,
          skills: flattenedSkills,
          preferredSkills: flattenedSkills 
        });

        // Cập nhật URL avatar để hiển thị preview
        setAvatarUrl(res.avatar_url || '');
      }
    } catch (err) {
      console.error("Lỗi khởi tạo hệ thống:", err);
    } finally {
      setLoading(false);
    }
  }

  initData();
}, []); // Chạy 1 lần duy nhất khi mount

  // 2. Logic Tìm kiếm
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
   const filtered = filterSkills(allSkills, value, data.preferredSkills);
  setSuggestions(filtered);
  };

  const addSkill = (skill: any) => {
    setData({ ...data, skills: [...data.skills, skill] });
    setSearchTerm("");
    setSuggestions([]);
  };

  const removeSkill = (skillId: string) => {
    setData({ ...data, skills: data.skills.filter(s => s.id !== skillId) });
  };

  // 3. Update dữ liệu
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Hết phiên đăng nhập");

      let finalAvatarUrl = avatarUrl;

      // Upload Avatar
      if (avatarFile) {
        const filePath = `${user.id}/avatar-${Date.now()}`;
        const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, avatarFile);
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
          finalAvatarUrl = publicUrl;
        }
      }

      // Update bảng Users
      await supabase.from('users').upsert({
        id: user.id,
        full_name: data.fullName,
        bio: data.bio,
        price: data.price,
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString()
      });

      // Update bảng Freelancer_Skills
      const skillIds = data.skills.map(s => s.id);
      await updateFreelancerSkills(supabase, user.id, skillIds);

      setMessage('Cập nhật thành công!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Đang tải hồ sơ...</div>;

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
      {message && (
        <div className="fixed top-5 right-5 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg z-50">
          {message}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-slate-800">Hồ sơ Freelancer</h2>

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full border-4 border-violet-50 overflow-hidden bg-slate-100">
            {(avatarUrl || avatarFile) ? (
              <img src={avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
            )}
          </div>
          <label className="text-sm font-bold text-violet-600 cursor-pointer">
            Thay đổi ảnh
            <input type="file" className="hidden" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên</label>
          <input 
            type="text" 
            className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-violet-400 outline-none"
            value={data.fullName}
            onChange={e => setData({...data, fullName: e.target.value})}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Giới thiệu</label>
          <textarea
            className="w-full p-4 border rounded-2xl h-32 focus:ring-2 focus:ring-violet-400 outline-none"
            value={data.bio}
            onChange={(e) => setData({ ...data, bio: e.target.value })}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Giá dịch vụ (USD/giờ)</label>
          <input
            type="number"
            className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-violet-400 outline-none"
            value={data.price}
            onChange={(e) => setData({ ...data, price: parseFloat(e.target.value) || 0 })}
          />
        </div>

        {/* Kỹ năng - Search & Tags */}
        <div className="relative">
          <label className="block text-sm font-bold text-slate-700 mb-2">Kỹ năng chuyên môn</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {data.skills.map((skill) => (
              <span key={skill.id} className="px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-sm font-semibold flex items-center gap-2">
                {skill.name}
                <button type="button" onClick={() => removeSkill(skill.id)} className="hover:text-rose-500 font-bold">×</button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm kỹ năng..."
            className="w-full p-4 border rounded-2xl outline-none focus:border-violet-400"
            value={searchTerm}
            onChange={handleSearch}
          />
          
          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute w-full mt-1 bg-white border rounded-xl shadow-xl z-10 overflow-hidden">
              {suggestions.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => addSkill(s)}
                  className="p-3 hover:bg-violet-50 cursor-pointer flex justify-between items-center"
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-slate-400">{s.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="text-rose-500 text-sm font-bold">{error}</div>}

        <button 
          type="submit" 
          disabled={saving} 
          className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg transition active:scale-95 ${bgGradient} ${saving ? 'opacity-50' : ''}`}
        >
          {saving ? "Đang xử lý..." : "Lưu hồ sơ Freelancer"}
        </button>
      </form>
    </div>
  );
}