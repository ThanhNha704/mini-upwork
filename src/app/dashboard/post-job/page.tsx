// src/app/dashboard/post-job/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function PostJob() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ title: "", budget: "", description: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate
    if (!formData.title.trim() || !formData.budget || !formData.description.trim()) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const budgetNum = Number(formData.budget);
    if (budgetNum <= 0) {
      setError("Ngân sách phải lớn hơn 0");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          budget: budgetNum,
          description: formData.description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Lỗi đăng bài");
        return;
      }

      setSuccess(true);
      setFormData({ title: "", budget: "", description: "" });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/client/manage-jobs");
      }, 2000);
    } catch (err) {
      setError("Lỗi kết nối. Vui lòng thử lại.");
      console.error("Post job error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-3xl font-bold text-center text-slate-900">Đăng dự án mới</h2>
        
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            <AlertCircle size={20} className="shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700">
            <CheckCircle size={20} className="shrink-0" />
            <p className="font-medium">Đăng bài thành công! Đang chuyển hướng...</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Tiêu đề dự án</label>
          <input 
            type="text"
            required
            disabled={loading || success}
            className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition disabled:bg-slate-50 disabled:text-slate-500" 
            placeholder="Tiêu đề dự án..."
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Ngân sách ($)</label>
          <input 
            type="number"
            required
            min="1"
            step="0.01"
            disabled={loading || success}
            className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none transition disabled:bg-slate-50 disabled:text-slate-500" 
            placeholder="Ngân sách..."
            value={formData.budget}
            onChange={(e) => setFormData({...formData, budget: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Mô tả chi tiết</label>
          <textarea 
            required
            disabled={loading || success}
            className="w-full p-4 border border-slate-200 rounded-2xl h-40 focus:ring-2 focus:ring-violet-500 outline-none transition disabled:bg-slate-50 disabled:text-slate-500" 
            placeholder="Mô tả chi tiết công việc..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loading || success}
          className="w-full bg-linear-to-r from-violet-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={20} className="animate-spin" /> Đang đăng...</> : "Đăng bài ngay"}
        </button>
      </form>
    </div>
  );
}