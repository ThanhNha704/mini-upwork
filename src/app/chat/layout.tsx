"use client";
// import { Metadata } from 'next'
import { useEffect, useState } from "react";
import { createClient } from "@/src/utils/supabase/client";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
// export const metadata: Metadata = {
//   title: 'Tin nhắn',
//   description: 'Trò chuyện với khách hàng và nhà cung cấp dịch vụ của bạn',
// }

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const params = useParams();
  const activeId = params?.id; // Lấy ID từ URL

  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    const fetchConvs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("conversations")
          .select(`
            *, 
            client:clientId(id, full_name, avatar_url), 
            freelancer:freelancerId(id, full_name, avatar_url)
          `)
          .or(`clientId.eq.${user.id},freelancerId.eq.${user.id}`)
          .order('updatedAt', { ascending: false });

        if (data) setConversations(data);
      }
    };
    fetchConvs();
  }, []);

  const getPartnerInfo = (conv: any) => {
    if (!user || !conv) return null;
    return conv.clientId === user.id ? conv.freelancer : conv.client;
  };

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
              const isActive = activeId === conv.id;
              return (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${
                    isActive ? "bg-white shadow-sm border-violet-600 border" : "hover:bg-gray-100"
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
                </Link>
              );
            })}
          </div>
        </aside>

        {/* NỘI DUNG CHAT */}
        <main className="flex flex-col h-full bg-white overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}