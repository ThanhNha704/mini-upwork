"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getJobDetails,
    getJobProposals,
    acceptProposal
} from "@/src/actions/jobActions";
import {
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    X,
    Pencil
} from "lucide-react";

export default function JobDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [job, setJob] = useState<any>(null);
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // State quản lý thông báo của bạn đây
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const jobData = await getJobDetails(id as string);
            const proposalsData = await getJobProposals(id as string);
            setJob(jobData);
            setProposals(proposalsData);
        } catch (error) {
            showStatus("Không thể tải dữ liệu dự án", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log(job);
        if (id) loadData();
    }, [id]);

    // Hàm tiện ích để hiển thị thông báo và tự ẩn sau 3 giây
    const showStatus = (msg: string, type: "success" | "error") => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage(null);
            setMessageType(null);
        }, 3000);
    };

    const handleAcceptFreelancer = async (appId: string) => {
        try {
            const res = await acceptProposal(id as string, appId);
            if (res.success) {
                showStatus("Đã chấp nhận ứng viên thành công!", "success");
                loadData();
            } else {
                showStatus(res.error || "Có lỗi xảy ra", "error");
            }
        } catch (error) {
            showStatus("Lỗi kết nối hệ thống", "error");
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải...</div>;
    if (!job) return <div className="p-10 text-center text-red-500">Dự án không tồn tại.</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6 relative">

            {/* Hiển thị thông báo (Alert UI) */}
            {message && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-4 ${messageType === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                    }`}>
                    {messageType === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p className="font-medium">{message}</p>
                    <button onClick={() => setMessage(null)} className="ml-4 hover:opacity-70">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Nút quay lại */}
            <button
                onClick={() => router.push("/dashboard/client/jobs")}
                className="flex items-center text-gray-500 hover:text-black transition-colors"
            >
                <ArrowLeft size={18} className="mr-2" /> Danh sách dự án
            </button>

            {/* Header dự án */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100 uppercase">
                            {job.status}
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900 mt-3">{job.title}</h1>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 uppercase font-semibold">Ngân sách</p>
                        <p className="text-3xl font-black text-blue-600">${job.budget?.toLocaleString()}</p>
                    </div>
                </div>

                <p className="text-gray-600 leading-relaxed bg-gray-50 p-5 rounded-xl border border-gray-100">
                    {job.description}
                </p>
            </div>
            <div className="flex justify-end"> {/* Thường nút sửa nên để bên phải */}
                <button
                    onClick={() => router.push(`/dashboard/client/jobs/${id}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm"
                >
                    <Pencil size={16} />
                    Chỉnh sửa dự án
                </button>
            </div>

            {/* Danh sách ứng viên */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Ứng viên đã nộp đơn</h2>
                <div className="grid gap-4">
                    {proposals.length === 0 ? (
                        <div className="p-10 text-center border-2 border-dashed rounded-2xl text-gray-400">
                            Chưa có ứng viên nào ứng tuyển.
                        </div>
                    ) : (
                        proposals.map((app) => (
                            <div key={app.id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 border border-gray-200">
                                        {app.freelancer?.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{app.freelancer?.full_name}</h4>
                                        <p className="text-sm text-gray-500 mb-2">{app.freelancer?.email}</p>
                                        <div className="text-sm text-gray-600 bg-blue-50/50 p-3 rounded-lg border-l-2 border-blue-300">
                                            <strong>Thư ngỏ:</strong> {app.coverLetter}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto">
                                    {app.status === 'ACCEPTED' ? (
                                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-6 py-2 rounded-xl border border-green-200 font-bold">
                                            <CheckCircle size={18} /> Đã chọn
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleAcceptFreelancer(app.id)}
                                                className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-blue-100 shadow-lg"
                                            >
                                                Chấp nhận
                                            </button>
                                            <button className="flex-1 md:flex-none border border-gray-200 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                                Chat
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

        </div>
    );
}