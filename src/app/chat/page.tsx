"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/src/utils/supabase/client";
import { Send, Loader2, MessageSquare } from "lucide-react";

export default function ChatPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Khởi tạo User và Danh sách hội thoại
  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from("conversations")
          .select(`
            *, 
            client:clientId(id, full_name), 
            freelancer:freelancerId(id, full_name)
          `)
          .or(`clientId.eq.${user.id},freelancerId.eq.${user.id}`)
          .order('updatedAt', { ascending: false });
        
        if (!error && data) {
          setConversations(data);
          if (data.length > 0) setActiveConv(data[0]);
        }
      }
      setLoading(false);
    };
    initChat();
  }, []);

  // 2. Fetch tin nhắn và Đăng ký Realtime
  useEffect(() => {
    if (!activeConv || !user) return;

    // Lấy tin nhắn cũ
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("message")
        .select("*")
        .eq("conversationId", activeConv.id)
        .order("createdAt", { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();

    console.log("Đăng ký Realtime cho conversationId:", activeConv.id);
    console.log(messages);

    // Lắng nghe tin nhắn mới qua Realtime
    const channel = supabase
      .channel(`room-${activeConv.id}`)
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'message',
          filter: `conversationId=eq.${activeConv.id}` 
        },
        (payload) => {
          // Tránh lặp tin nhắn nếu tin nhắn vừa gửi đã được render từ handleSend
          setMessages((prev) => {
            const isExist = prev.some(m => m.id === payload.new.id);
            if (isExist) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConv, user]);

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Hàm gửi tin nhắn
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !user || !activeConv) return;

    setNewMessage(""); // Clear input ngay để UX mượt

    const { error } = await supabase.from("message").insert({
      conversationId: activeConv.id,
      senderId: user.id,
      content: content,
    });

    if (error) {
      console.error("Lỗi gửi tin nhắn:", error.message);
      console.error("senderId: ", user.id, "activeConv: ", activeConv.id, "content: ", content);
    }
  };

  // Helper: Xác định thông tin người đang chat cùng
  const getPartnerInfo = (conv: any) => {
    if (!user || !conv) return null;
    return conv.clientId === user.id ? conv.freelancer : conv.client;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[350px_1fr] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 h-[80vh]">
        
        {/* SIDEBAR */}
        <aside className="border-r border-gray-100 flex flex-col bg-slate-50/50">
          <div className="p-6 border-b border-gray-100 bg-white">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="text-violet-600" /> Hội thoại
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-4 space-y-3">
            {conversations.map((conv) => {
              const partner = getPartnerInfo(conv);
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full p-4 rounded-3xl flex items-center gap-3 transition-all ${
                    activeConv?.id === conv.id 
                      ? "bg-white shadow-md border-violet-200 border" 
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold shrink-0">
                    {partner?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="font-bold text-slate-800 truncate">{partner?.full_name}</p>
                    <p className="text-xs text-slate-500">Bấm để chat</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CHAT AREA */}
        <main className="flex flex-col h-full bg-white">
          {activeConv ? (
            <>
              <header className="p-6 border-b border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
                  {getPartnerInfo(activeConv)?.full_name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-slate-900">
                  {getPartnerInfo(activeConv)?.full_name}
                </h3>
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] p-4 rounded-3xl text-sm shadow-sm ${
                        isMe 
                          ? "bg-violet-600 text-white rounded-br-none" 
                          : "bg-white border border-gray-100 text-slate-800 rounded-bl-none"
                      }`}>
                        {msg.content}
                        <p className={`text-[9px] mt-1 opacity-60 ${isMe ? "text-right" : "text-left"}`}>
                           {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              <form onSubmit={handleSend} className="p-6 border-t border-gray-100 flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Viết tin nhắn..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-3 outline-none focus:border-violet-400 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-linear-to-r from-violet-600 to-cyan-500 text-white p-3 rounded-2xl hover:opacity-90 transition shadow-lg disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-300">
              <p>Chọn một người để trò chuyện</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}