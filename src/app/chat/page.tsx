import { Send } from "lucide-react";

export default function NoActiveChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 bg-slate-50">
      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm">
        <Send size={32} className="text-violet-200 -rotate-12" />
      </div>
      <p className="text-sm font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
    </div>
  );
}