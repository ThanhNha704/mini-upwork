// src/app/(dashboard)/freelancer/profile/page.tsx
"use client";
import { useState } from "react";

export default function FreelancerProfile() {
  const [skills, setSkills] = useState(["React", "NextJS", "Tailwind"]);
  const bgGradient = "bg-linear-to-r from-violet-600 to-cyan-500";

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Hồ sơ chuyên gia</h2>
      
      <div className="space-y-6">
        {/* Bio */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Giới thiệu bản thân</label>
          <textarea 
            className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none h-32"
            placeholder="Kinh nghiệm làm việc của bạn..."
          ></textarea>
        </div>

        {/* Skills Tags */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Kỹ năng chuyên môn</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map(s => (
              <span key={s} className="px-4 py-1.5 bg-violet-50 text-violet-600 rounded-full text-sm font-medium flex items-center gap-2">
                {s} <button className="hover:text-rose-500">×</button>
              </span>
            ))}
          </div>
          <input 
            type="text" 
            placeholder="Nhấn Enter để thêm kỹ năng"
            className="w-full p-4 border rounded-2xl outline-none focus:border-violet-400"
          />
        </div>

        <button className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg shadow-violet-100 ${bgGradient}`}>
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}