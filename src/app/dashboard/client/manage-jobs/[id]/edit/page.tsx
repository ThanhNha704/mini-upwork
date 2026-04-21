"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobDetails, updateJob } from "@/src/actions/jobActions";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    status: "",
    skillIds: []
  });

  // 1. Lấy dữ liệu cũ khi vừa vào trang
  useEffect(() => {
  async function loadJob() {
    try {
      const result = await getJobDetails(id as string);
      
      // Kiểm tra nếu result tồn tại và có chứa thuộc tính job
      if (result && result.job) {
        const jobData = result.job;

        setFormData({
          title: jobData.title,
          description: jobData.description,
          budget: jobData.budget.toString(),
          status: jobData.status,
          // Nếu form của bạn có phần chọn skill, hãy map ID của chúng ra mảng string
          skillIds: jobData.skills?.map((s: any) => s.id) || []
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu chỉnh sửa:", error);
    } finally {
      setLoading(false);
    }
  }

  if (id) {
    loadJob();
  }
}, [id]);

  // 2. Xử lý khi nhấn Lưu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const res = await updateJob(id as string, formData);
    
    if (res.success) {
      setMessage("Cập nhật dự án thành công!");
      setTimeout(() => router.push(`/dashboard/client/manage-jobs/${id}`), 1500);
    } else {
      setMessage("Lỗi: " + res.error);
    }
    setIsUpdating(false);
  };

  if (loading) return <div className="p-10 text-center">Đang tải thông tin dự án...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-gray-500 hover:text-black mb-6"
      >
        <ArrowLeft size={18} className="mr-2" /> Quay lại
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Chỉnh sửa dự án</h1>

        {message && (
          <div className={`p-4 mb-6 rounded-lg ${message.includes("thành công") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">Tiêu đề dự án</label>
            <input
              type="text"
              required
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Mô tả chi tiết</label>
            <textarea
              required
              rows={6}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Ngân sách ($)</label>
            <input
              type="number"
              required
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 bg-linear-to-r from-violet-600 to-cyan-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {isUpdating ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Lưu thay đổi
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}