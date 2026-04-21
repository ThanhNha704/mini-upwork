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

    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const result = await getJobDetails(id as string);
            const proposalsData = await getJobProposals(id as string);

            // CẬP NHẬT: Lấy job từ result.job do cấu trúc action mới trả về { job, client }
            setJob(result?.job || null);
            setProposals(proposalsData || []);
        } catch (error) {
            showStatus("Không thể tải dữ liệu dự án", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadData();
    }, [id]);

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

    if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Đang tải dữ liệu...</div>;
    if (!job) return <div className="p-10 text-center text-red-500 font-bold">Dự án không tồn tại.</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6 relative">

            {/* Hiển thị thông báo */}
            {message && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-4 ${messageType === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
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
                onClick={() => router.push("/dashboard/client/manage-jobs")}
                className="flex items-center text-gray-500 hover:text-black transition-colors font-semibold text-sm"
            >
                <ArrowLeft size={18} className="mr-2" /> DANH SÁCH DỰ ÁN
            </button>

            {/* Header dự án */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                            {job.status}
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900 mt-3">{job.title}</h1>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Ngân sách</p>
                        <p className="text-3xl font-black text-blue-600">${job.budget?.toLocaleString()}</p>
                    </div>
                </div>

                <div className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100 whitespace-pre-wrap">
                    {job.description}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => router.push(`/dashboard/client/manage-jobs/${id}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 rounded-lg text-sm font-semibold transition-all shadow-sm"
                >
                    <Pencil size={16} />
                    Chỉnh sửa dự án
                </button>
            </div>

            {/* Danh sách ứng viên */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Ứng viên đã nộp đơn ({proposals.length})</h2>
                <div className="grid gap-4">
                    {proposals.length === 0 ? (
                        <div className="p-10 text-center border-2 border-dashed rounded-2xl text-gray-400 font-medium">
                            Chưa có ứng viên nào ứng tuyển.
                        </div>
                    ) : (
                        proposals.map((app) => (
                            <div key={app.id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex gap-4 flex-1">
                                    <img
                                        src={app.freelancer?.avatar_url || `https://ui-avatars.com/api/?name=${app.freelancer?.full_name || 'F'}`}
                                        className="w-12 h-12 rounded-full object-cover border border-gray-100"
                                        alt="avatar"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg text-gray-900">{app.freelancer?.full_name}</h4>
                                        <p className="text-sm text-gray-500 mb-2">{app.freelancer?.email}</p>
                                        <div className="text-sm text-gray-600 bg-blue-50/30 p-4 rounded-lg border-l-4 border-blue-200 italic">
                                            <strong className="not-italic text-blue-800 text-xs uppercase block mb-1">Thư ngỏ:</strong>
                                            "{app.proposal}"
                                        </div>
                                        <p className="mt-2 text-xs font-bold text-gray-400 uppercase">Giá chào thầu: <span className="text-blue-600">${app.bidAmount?.toLocaleString()}</span></p>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto shrink-0">
                                    {app.status === 'ACCEPTED' ? (
                                        <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 px-6 py-2.5 rounded-xl border border-green-200 font-bold w-full md:w-auto">
                                            <CheckCircle size={18} /> Đã chấp nhận
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleAcceptFreelancer(app.id)}
                                                className="flex-1 md:flex-none bg-gradient-to-r from-violet-600 to-cyan-500 text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-blue-100 uppercase text-xs tracking-wider"
                                            >
                                                Chấp nhận
                                            </button>

                                            <button
                                                onClick={() => router.push(`/talent/${app.freelancerId}`)}
                                                className="flex-1 md:flex-none border border-gray-300 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all text-gray-700 uppercase text-xs tracking-wider"
                                            >
                                                Hồ sơ
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