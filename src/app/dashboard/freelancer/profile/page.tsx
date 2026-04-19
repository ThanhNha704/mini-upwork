// src/app/dashboard/freelancer/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/src/utils/supabase/client";

export default function FreelancerProfile() {
  const supabase = createClient();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    fullName: "",
    bio: "",
    avatarUrl: "",
    email: "",
    role: "FREELANCER",
    price: 0,
    skills: [] as string[],
  });

  const bgGradient = "bg-linear-to-r from-violet-600 to-cyan-500";

  useEffect(() => {
    async function loadProfile() {

      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select(`
      full_name, 
      avatar_url, 
      bio, 
      email, 
      role,
      price,
      freelancer_skills (
        skills (
          id,
          name,
          category
        )
      )
    `)
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setData({
            fullName: data.full_name || '',
            avatarUrl: data.avatar_url || '',
            bio: data.bio || '',
            email: data.email || '',
            role: data.role || '',
            price: data.price || 0,
            skills: data.freelancer_skills
              ? data.freelancer_skills.map((item: any) => item.skills).filter(Boolean)
              : []
          });
          setAvatarUrl(data.avatar_url || '');
        }
      }
      setLoading(false);
    }

    loadProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let newAvatarUrl = data.avatarUrl

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true })

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
        newAvatarUrl = publicUrl
        setAvatarUrl(publicUrl)
      }
    }

    const { error } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      full_name: data.fullName,
      bio: data.bio,
      role: data.role,
      price: data.price,
      avatar_url: newAvatarUrl,
      updated_at: new Date().toISOString()
    })

    if (!error) {
      setMessage('Cập nhật thông tin thành công!')
      setTimeout(() => setMessage(null), 5000)
    }
    else setError('Lỗi cập nhật: ' + error.message)

    setSaving(false)
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      {/* Success Toast */}
      {message && (
        <div className="fixed top-5 right-5 z-50 animate-bounce-in">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <span className="font-semibold">{message}</span>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6">Hồ sơ chuyên gia</h2>

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 w-1/3 mx-auto">
          <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-violet-100 overflow-hidden flex items-center justify-center shadow-inner">
            {avatarUrl || avatarFile ? (
              <img src={avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">Chưa có ảnh</span>
            )}
          </div>
          <label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 transition">
            Đổi Avatar
            <input type="file" className="hidden" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        {/* Bio */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Giới thiệu bản thân</label>
          <textarea
            className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none h-32"
            placeholder="Kinh nghiệm làm việc của bạn..."
            value={data.bio}
            onChange={(e) => setData({ ...data, bio: e.target.value })}

          ></textarea>
        </div>

        {/* Mức giá (USD/giờ) */}
        <label className="block text-sm font-bold text-slate-700 mb-2"> Mức giá mong muốn (USD/giờ) </label>
        <input
          type="number"
          placeholder="Mức giá mong muốn"
          className="w-full p-4 border rounded-2xl outline-none focus:border-violet-400"
          value={data.price || ''}
          onChange={(e) => setData({ ...data, price: parseFloat(e.target.value) || 0 })}
        />

        {/* Skills Tags */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Kỹ năng chuyên môn</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {data.skills?.map((skill: any) => (
              <span key={skill.id} className="px-4 py-1.5 bg-violet-50 text-violet-600 rounded-full text-sm font-medium flex items-center gap-2">
                {skill.name} <button className="hover:text-rose-500">×</button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Nhấn Enter để thêm kỹ năng"
            className="w-full p-4 border rounded-2xl outline-none focus:border-violet-400"
          />
        </div>

        {message && <div className="p-4 bg-green-50 border border-green-500 text-green-700 rounded-md text-sm font-bold">{message}</div>}
        {error && <div className="p-4 bg-rose-50 border border-rose-500 text-rose-700 rounded-md text-sm font-bold">{error}</div>}

        <button type="submit" disabled={saving} className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg shadow-violet-100 ${bgGradient}`}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}