"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/src/utils/supabase/client";
import { ChevronLeft, Send, Loader2 } from "lucide-react";

export default function FreelancerProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [freelancer, setFreelancer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        (async () => {
            const { data } = await supabase
                .from("users")
                .select("*, freelancer_skills(skills(name))")
                .eq("id", id)
                .single();
            setFreelancer(data);
            setLoading(false);
        })();
    }, [id, supabase]);

    // LOGIC GỬI THƯ THEO CONVERSATION
    const handleInvite = async (formData: FormData) => {
        setIsSending(true);
        setStatus("");
        const content = formData.get("content") as string;
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setIsSending(false);
            return setStatus("Lỗi: Vui lòng đăng nhập!");
        }

        try {
            // Kiểm tra/Tìm cuộc hội thoại hiện có giữa Client và Freelancer
            let { data: conv } = await supabase
                .from("conversations")
                .select("id")
                .eq("clientId", user.id)
                .eq("freelancerId", id)
                .maybeSingle();

            let conversationId = conv?.id;

            // Nếu chưa có hội thoại, tạo mới
            if (!conversationId) {
                const { data: newConv, error: convErr } = await supabase
                    .from("conversations")
                    .insert({ clientId: user.id, freelancerId: id })
                    .select("id")
                    .single();
                
                if (convErr) throw convErr;
                conversationId = newConv.id;
            }

            // Thêm tin nhắn vào bảng message
            const { error: msgErr } = await supabase.from("message").insert({
                conversationId: conversationId,
                senderId: user.id,
                content: content
            });

            if (msgErr) throw msgErr;

            setStatus("Đã gửi thư mời thành công!");
        } catch (error: any) {
            console.error(error);
            setStatus("Lỗi: Không thể gửi thư mời!");
        } finally {
            setIsSending(false);
        }
    };

    if (loading) return <Loader2 className="animate-spin mx-auto mt-20" />;
    if (!freelancer) return <div className="text-center mt-20">Không tìm thấy hồ sơ.</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <button onClick={() => router.back()} className="flex items-center gap-2 mb-8 font-bold text-slate-500">
                <ChevronLeft size={20} /> Quay lại
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border">
                        <div className="flex gap-6 items-center mb-8 ">
                            <div className="relative w-24 h-24 p-1 rounded-full bg-linear-to-r from-violet-600 to-cyan-500">
                                <img src={freelancer.avatar_url || "/default-avatar.png"} className="w-full h-full rounded-full object-cover shadow-inner bg-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{freelancer.full_name}</h1>
                                <p className="text-violet-600 font-bold uppercase text-xs tracking-widest">{freelancer.role}</p>
                            </div>
                        </div>

                        <p className="text-slate-600 mb-8 leading-relaxed">{freelancer.bio || "Chưa có giới thiệu."}</p>

                        <div className="flex flex-wrap gap-2">
                            {freelancer.freelancer_skills?.map((s: any) => (
                                <span key={s.skills.name} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                                    {s.skills.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <form action={handleInvite} className="bg-white p-8 rounded-[2.5rem] shadow-xl border sticky top-24 space-y-4">
                        <h3 className="font-bold uppercase text-sm tracking-widest text-slate-800">Gửi thư mời</h3>
                        <textarea
                            name="content"
                            required
                            placeholder="Nhập nội dung công việc..."
                            className="w-full h-32 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-violet-500 text-sm transition-all"
                        />
                        
                        {status && (
                            <div className={`p-3 rounded-xl text-xs font-bold ${status.includes("Lỗi") ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}>
                                {status}
                            </div>
                        )}

                        <button 
                            disabled={isSending}
                            className="w-full py-4 bg-linear-to-r from-violet-600 to-cyan-500 text-white rounded-2xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-violet-200"
                        >
                            {isSending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                            {isSending ? "Đang gửi..." : "Gửi ngay"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}