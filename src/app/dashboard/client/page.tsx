"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/src/utils/supabase/client";
import {
    PlusCircle,
    Briefcase,
    Clock,
    CheckCircle2,
    MoreVertical,
    Search
} from "lucide-react";
import Link from "next/link";

export default function ClientDashboard() {
    const supabase = createClient();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function fetchJobs() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("job")
                    .select("*")
                    .eq("clientId", user.id)
                    .order("createdAt", { ascending: false });

                setJobs(data || []);
            }
            setLoading(false);
        }
        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "OPEN": return "bg-green-100 text-green-700 border-green-200";
            case "IN_PROGRESS": return "bg-blue-100 text-blue-700 border-blue-200";
            case "COMPLETED": return "bg-purple-100 text-purple-700 border-purple-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển Khách hàng</h1>
                    <p className="text-gray-500">Quản lý các dự án và tìm kiếm freelancer phù hợp.</p>
                </div>
                <Link href="/dashboard/client/post-job" className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-violet-600 to-cyan-500 px-6 py-3 text-white font-bold shadow-lg hover:opacity-95 transition">
                    <PlusCircle size={18} /> Đăng dự án mới
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard icon={<Briefcase className="text-blue-600" />} label="Tổng dự án" value={jobs.length} />
                <StatCard icon={<Clock className="text-yellow-600" />} label="Đang thực hiện" value={jobs.filter(j => j.status === 'IN_PROGRESS').length} />
                <StatCard icon={<CheckCircle2 className="text-green-600" />} label="Đã hoàn thành" value={jobs.filter(j => j.status === 'COMPLETED').length} />
            </div>

            {/* Jobs Table/List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">Dự án của bạn</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm dự án..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                                <th className="px-6 py-4 font-medium">Tiêu đề dự án</th>
                                <th className="px-6 py-4 font-medium">Ngân sách</th>
                                <th className="px-6 py-4 font-medium">Trạng thái</th>
                                <th className="px-6 py-4 font-medium">Ngày đăng</th>
                                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-10 text-gray-500">Đang tải dữ liệu...</td></tr>
                            ) : filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">
                                        {searchTerm ? "Không tìm thấy dự án phù hợp." : "Bạn chưa có dự án nào."}
                                    </td>
                                </tr>
                            ) : (
                                filteredJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                                        <td className="px-6 py-4 text-gray-600">${job.budget?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(job.status)}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreVertical size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Component con cho thẻ thống kê
function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}