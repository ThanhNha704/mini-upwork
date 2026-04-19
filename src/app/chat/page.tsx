"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/src/utils/supabase/client";
import { Send, Loader2, MessageSquare, User, ArrowLeft } from "lucide-react";

export default function ChatPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Cập nhật fetch để lấy thêm avatar_url
  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from("conversations")
          .select(`
            *, 
            client:clientId(id, full_name, avatar_url), 
            freelancer:freelancerId(id, full_name, avatar_url)
          `)
          .or(`clientId.eq.${user.id},freelancerId.eq.${user.id}`)
          .order('updatedAt', { ascending: false });

        console.log("Fetched conversations:", data, "Error:", error);

        if (!error && data) {
          setConversations(data);
          if (data.length > 0) setActiveConv(data[0]);
        }
      }
      setLoading(false);
    };
    initChat();
  }, []);

  // 2. Fetch tin nhắn & Realtime
  useEffect(() => {
    if (!activeConv || !user) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("message")
        .select("*")
        .eq("conversationId", activeConv.id)
        .order("createdAt", { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();

    const channel = supabase
      .channel(`room-${activeConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'message',
        filter: `conversationId=eq.${activeConv.id}`
      },
        (payload) => {
          setMessages((prev) => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConv, user]);

  // Sửa lỗi cuộn: Chỉ cuộn mượt khi tin nhắn mới xuất hiện
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !user || !activeConv) return;
    setNewMessage("");
    await supabase.from("message").insert({
      conversationId: activeConv.id,
      senderId: user.id,
      content: content,
    });
  };

  const getPartnerInfo = (conv: any) => {
    if (!user || !conv) return null;
    return conv.clientId === user.id ? conv.freelancer : conv.client;
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-violet-600" size={40} /></div>
  );

  return (
    <div className="h-[calc(100dvh-80px)] bg-gray-50 p-4 md:p-6 overflow-hidden">
      <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 h-full grid grid-cols-1 md:grid-cols-[320px_1fr] overflow-hidden">
        {/* SIDEBAR */}
        <aside className="border-r border-gray-200 flex flex-col bg-slate-50/50 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-white">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="text-violet-600" size={20} /> Hội thoại
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {conversations.map((conv) => {
              const partner = getPartnerInfo(conv);
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${activeConv?.id === conv.id ? "bg-white shadow-sm border-violet-600 border" : "hover:bg-gray-100"
                    }`}
                >
                  {partner?.avatar_url ? (
                    <img src={partner.avatar_url} alt="avatar" className="w-11 h-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold shrink-0">
                      {partner?.full_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-left overflow-hidden">
                    <p className="font-bold text-sm text-slate-800 truncate">{partner?.full_name}</p>
                    <p className="text-[11px] text-slate-500">Bấm để chat</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex flex-col h-full bg-white overflow-hidden">
          {activeConv ? (
            <>
              <header className="p-3 px-4 border-b border-gray-100 flex items-center justify-between shadow-sm bg-white z-10">
                <div className="flex items-center gap-3">
                  {/* Nút quay lại chỉ hiện khi có activeConv (Hữu ích cho Mobile) */}
                  <button
                    onClick={() => setActiveConv(null)}
                    className="p-1 -ml-1 text-slate-400 hover:text-violet-600 transition-colors md:hidden"
                  >
                    <ArrowLeft size={22} />
                  </button>

                  <div className="relative">
                    {getPartnerInfo(activeConv)?.avatar_url ? (
                      <img src={getPartnerInfo(activeConv).avatar_url} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-linear-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                        {getPartnerInfo(activeConv)?.full_name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Chấm xanh online (nếu có dữ liệu) */}
                    {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div> */}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 leading-none">{getPartnerInfo(activeConv)?.full_name}</h3>
                    {/* <p className="text-[11px] text-green-500 font-medium mt-1">Đang hoạt động</p> */}
                  </div>
                </div>
              </header>

              {/* Khu vực tin nhắn */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f8fafc] custom-scrollbar">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 self-end overflow-hidden shadow-sm">
                          {getPartnerInfo(activeConv)?.avatar_url ?
                            <img src={getPartnerInfo(activeConv).avatar_url} className="w-full h-full object-cover" /> :
                            <div className="w-full h-full rounded-full bg-linear-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                              {getPartnerInfo(activeConv)?.full_name?.charAt(0).toUpperCase()}
                            </div>
                          }
                        </div>
                      )}
                      <div className={`group relative max-w-[70%] p-3 px-4 rounded-2xl text-[13px] shadow-sm transition-all ${isMe
                          ? "bg-violet-600 text-white rounded-br-none"
                          : "bg-white border border-gray-100 text-slate-800 rounded-bl-none"
                        }`}>
                        <div className="whitespace-pre-wrap wrap-break-words">{msg.content}</div>
                        <p className={`text-[9px] mt-1.5 font-medium opacity-50 ${isMe ? "text-right" : "text-left"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              {/* Input gửi tin nhắn */}
              <div className="p-4 bg-white border-t border-gray-100">
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
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 bg-slate-50">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                <Send size={32} className="text-violet-200 -rotate-12" />
              </div>
              <p className="text-sm font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}