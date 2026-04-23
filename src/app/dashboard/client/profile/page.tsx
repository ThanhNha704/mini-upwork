"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/src/utils/supabase/client";
import { fetchAllAvailableSkills, updateClientSkills, filterSkills } from "@/src/actions/skillActions";

export default function ClientProfile() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [allSkills, setAllSkills] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const [data, setData] = useState({
        fullName: "",
        bio: "",
        role: "CLIENT",
        price: 0,
        companyName: "",
        website: "",
        location: "",
        industry: "",
        companySize: "",
        budgetMin: 0,
        budgetMax: 0,
        budgetType: "fixed" as "hourly" | "fixed",
        preferredSkills: [] as any[],
    });

    const bgGradient = "bg-linear-to-r from-violet-600 to-cyan-500";

    useEffect(() => {
        async function initData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const skillsPool = await fetchAllAvailableSkills(supabase);
                setAllSkills(skillsPool);

                const { data: res, error: fetchError } = await supabase
                    .from("users")
                    .select(`
                        full_name, avatar_url, bio, email, role, price,
                        client_profiles (
                            company_name, website, location, industry, 
                            company_size, budget_min, budget_max, budget_type
                        ),
                        client_preferred_skills (
                            skills ( id, name )
                        )
                    `)
                    .eq("id", user.id)
                    .single();

                if (fetchError) throw fetchError;

                if (res) {
                    const cp = Array.isArray(res.client_profiles) ? res.client_profiles[0] : res.client_profiles;
                    const rawSkills = res.client_preferred_skills || [];

                    setData({
                        fullName: res.full_name || "",
                        bio: res.bio || "",
                        role: res.role || "CLIENT",
                        price: Number(res.price) || 0,
                        companyName: cp?.company_name || "",
                        website: cp?.website || "",
                        location: cp?.location || "",
                        industry: cp?.industry || "",
                        companySize: cp?.company_size || "",
                        budgetMin: Number(cp?.budget_min) || 0,
                        budgetMax: Number(cp?.budget_max) || 0,
                        budgetType: cp?.budget_type || "fixed",
                        preferredSkills: rawSkills.map((item: any) => item.skills).filter(Boolean),
                    });
                    setAvatarUrl(res.avatar_url || "");
                }
            } catch (err: any) {
                console.error("Lỗi khởi tạo:", err.message);
                setError("Không thể tải thông tin hồ sơ.");
            } finally {
                setLoading(false);
            }
        }
        initData();
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        const filtered = filterSkills(allSkills, value, data.preferredSkills);
        setSuggestions(filtered);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Phiên đăng nhập hết hạn");

            let finalAvatarUrl = avatarUrl;

            if (avatarFile) {
                const filePath = `avatars/${user.id}/${Date.now()}.png`;
                const { error: upErr } = await supabase.storage.from("avatars").upload(filePath, avatarFile, { upsert: true });
                if (upErr) throw upErr;
                const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
                finalAvatarUrl = publicUrl;
            }

            const { error: userErr } = await supabase.from("users").update({
                full_name: data.fullName,
                bio: data.bio,
                role: data.role,
                avatar_url: finalAvatarUrl,
                updated_at: new Date().toISOString()
            }).eq("id", user.id);
            if (userErr) throw userErr;

            const { error: profileErr } = await supabase.from("client_profiles").upsert({
                user_id: user.id,
                company_name: data.companyName,
                website: data.website,
                location: data.location,
                industry: data.industry,
                company_size: data.companySize,
                budget_min: data.budgetMin,
                budget_max: data.budgetMax,
                budget_type: data.budgetType,
                updated_at: new Date().toISOString()
            });
            if (profileErr) throw profileErr;

            const skillIds = data.preferredSkills.map(s => s.id);
            await updateClientSkills(supabase, user.id, skillIds);

            setMessage("Hồ sơ đã được cập nhật thành công!");
            setAvatarUrl(finalAvatarUrl);
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra khi lưu.");
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const addSkill = (skill: any) => {
        if (!data.preferredSkills.find(s => s.id === skill.id)) {
            setData(prev => ({ ...prev, preferredSkills: [...prev.preferredSkills, skill] }));
        }
        setSearchTerm("");
        setSuggestions([]);
    };

    const removeSkill = (id: string) => {
        setData(prev => ({ ...prev, preferredSkills: prev.preferredSkills.filter(s => s.id !== id) }));
    };

    if (loading) return <div className="p-20 text-center text-slate-500 font-medium">Đang tải hồ sơ...</div>;

    return (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto my-10">
            {message && (
                <div className="fixed top-5 right-5 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg z-50 animate-in fade-in slide-in-from-top-4">
                    {message}
                </div>
            )}

            <h2 className="text-2xl font-bold mb-8 text-slate-800">Cài đặt Hồ sơ Client</h2>

            <form onSubmit={handleUpdate} className="space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-32 h-32 rounded-full border-4 border-violet-50 overflow-hidden bg-slate-100 shadow-inner">
                        {(avatarUrl || avatarFile) ? (
                            <img src={avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                        )}
                    </div>
                    <label className="cursor-pointer text-sm font-bold text-violet-600 hover:text-violet-700 transition">
                        Thay đổi ảnh đại diện
                        <input type="file" className="hidden" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
                    </label>
                </div>

                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Họ và tên người đại diện</label>
                        <input type="text" className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-violet-400 outline-none transition" value={data.fullName} onChange={e => setData({ ...data, fullName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Tên công ty / Tổ chức</label>
                        <input type="text" className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-violet-400 outline-none transition" value={data.companyName} onChange={e => setData({ ...data, companyName: e.target.value })} />
                    </div>
                </div>

                {/* Industry & Company Size (Mới) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Lĩnh vực hoạt động</label>
                        <input type="text" className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-violet-400 outline-none" value={data.industry} onChange={e => setData({ ...data, industry: e.target.value })} placeholder="VD: Công nghệ, Marketing..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Quy mô nhân sự</label>
                        <select className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-violet-400 outline-none bg-white" value={data.companySize} onChange={e => setData({ ...data, companySize: e.target.value })}>
                            <option value="">Chọn quy mô...</option>
                            <option value="1-10">1-10 nhân viên</option>
                            <option value="11-50">11-50 nhân viên</option>
                            <option value="51-200">51-200 nhân viên</option>
                            <option value="201-500">201-500 nhân viên</option>
                            <option value="500+">Trên 500 nhân viên</option>
                        </select>
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Mô tả về công ty</label>
                    <textarea rows={4} className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-violet-400 outline-none transition" value={data.bio} onChange={e => setData({ ...data, bio: e.target.value })} placeholder="Giới thiệu ngắn gọn về lĩnh vực hoạt động của bạn..." />
                </div>

                {/* Website & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Website</label>
                        <input type="url" className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-violet-400 outline-none" value={data.website} onChange={e => setData({ ...data, website: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Địa điểm</label>
                        <input type="text" className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-violet-400 outline-none" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} placeholder="Hà Nội, VN" />
                    </div>
                </div>

                {/* Budget Configuration (Mới) */}
                <div className="p-6 bg-slate-50 rounded-3xl space-y-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                        Cấu hình ngân sách dự kiến
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Loại ngân sách</label>
                            <select 
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-violet-400 outline-none bg-white" 
                                value={data.budgetType} 
                                onChange={e => setData({ ...data, budgetType: e.target.value as any })}
                            >
                                <option value="fixed">Cố định (Project)</option>
                                <option value="hourly">Theo giờ (Hourly)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Tối thiểu ($)</label>
                            <input 
                                type="number" 
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-violet-400 outline-none" 
                                value={data.budgetMin} 
                                onChange={e => setData({ ...data, budgetMin: Number(e.target.value) })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Tối đa ($)</label>
                            <input 
                                type="number" 
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-violet-400 outline-none" 
                                value={data.budgetMax} 
                                onChange={e => setData({ ...data, budgetMax: Number(e.target.value) })} 
                            />
                        </div>
                    </div>
                </div>

                {/* Skills Selector */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-slate-700">Kỹ năng ưu tiên tuyển dụng</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {data.preferredSkills.map((skill: any) => (
                            <span key={skill.id} className="px-4 py-1.5 bg-violet-50 text-violet-600 rounded-full text-sm font-semibold flex items-center gap-2">
                                {skill.name}
                                <button type="button" onClick={() => removeSkill(skill.id)} className="text-lg hover:text-rose-500">×</button>
                            </span>
                        ))}
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-violet-400 outline-none transition"
                            placeholder="Gõ để tìm kiếm kỹ năng..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        {suggestions.length > 0 && (
                            <div className="absolute w-full mt-2 bg-white border rounded-xl shadow-2xl z-20 overflow-hidden">
                                {suggestions.map(s => (
                                    <div key={s.id} onClick={() => addSkill(s)} className="p-4 hover:bg-violet-50 cursor-pointer flex justify-between items-center border-b last:border-0">
                                        <span className="font-medium text-slate-700">{s.name}</span>
                                        <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{s.category}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100">{error}</div>}

                <button
                    type="submit"
                    disabled={saving}
                    className={`w-full py-4 text-white font-bold rounded-2xl shadow-xl transition active:scale-[0.98] ${bgGradient} ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-violet-200'}`}
                >
                    {saving ? "Đang xử lý..." : "Lưu tất cả thay đổi"}
                </button>
            </form>
        </div>
    );
}