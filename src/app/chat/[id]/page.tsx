"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/src/utils/supabase/client";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChatRoom() {
    const { id } = useParams();
    const supabase = createClient();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [user, setUser] = useState<any>(null);
    const [partner, setPartner] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initRoom = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // 1. Lấy thông tin partner (đối phương)
            const { data: conv } = await supabase
                .from("conversations")
                .select(`*, client:clientId(*), freelancer:freelancerId(*)`)
                .eq("id", id)
                .single();

            if (conv && user) {
                setPartner(conv.clientId === user.id ? conv.freelancer : conv.client);
            }

            // 2. Fetch tin nhắn
            const { data: msgs } = await supabase
                .from("message")
                .select("*")
                .eq("conversationId", id)
                .order("createdAt", { ascending: true });
            setMessages(msgs || []);
        };

        initRoom();

        const channel = supabase.channel(`room-${id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'message',
                filter: `conversationId=eq.${id}`
            }, (payload) => {
                setMessages((prev) => [...prev, payload.new]);
            }).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;
        const content = newMessage;
        setNewMessage("");
        await supabase.from("message").insert({
            conversationId: id,
            senderId: user.id,
            content: content,
        });
    };

    return (
        <>
            <header className="p-3 px-4 border-b border-gray-100 flex items-center justify-between shadow-sm bg-white z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <Link href="/chat" className="flex text-slate-400 hover:text-violet-600 transition-colors"><ArrowLeft size={22} /></Link>
                    <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
                        {partner?.avatar_url ? (
                            <img src={partner.avatar_url} className="object-cover w-full h-full" alt="avatar" />
                        ) : (
                            partner?.full_name?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <h3 className="font-bold text-slate-900">{partner?.full_name}</h3>
                </div>
            </header>

            {/* Khu vực tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f8fafc] custom-scrollbar">
                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                        <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            {/* Avatar của đối phương bên cạnh tin nhắn */}
                            {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 self-end overflow-hidden shadow-sm shrink-0">
                                    {partner?.avatar_url ? (
                                        <img src={partner.avatar_url} className="w-full h-full object-cover" alt="partner" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-linear-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold">
                                            {partner?.full_name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={`max-w-[70%] p-3 px-4 rounded-2xl text-[13px] shadow-sm ${
                                isMe 
                                ? "bg-violet-600 text-white rounded-br-none" 
                                : "bg-white border border-gray-100 text-slate-800 rounded-bl-none"
                            }`}>
                                <div className="whitespace-pre-wrap wrap-break-word">{msg.content}</div>
                                <p className={`text-[9px] mt-1.5 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input gửi tin nhắn */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1 pr-2 focus-within:border-violet-400 focus-within:ring-1 focus-within:ring-violet-400 transition-all">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập nội dung tin nhắn..."
                        className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-linear-to-r from-violet-600 to-cyan-500 text-white p-2 rounded-xl hover:shadow-lg hover:shadow-violet-200 transition-all disabled:opacity-30 disabled:grayscale"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </>
    );
}