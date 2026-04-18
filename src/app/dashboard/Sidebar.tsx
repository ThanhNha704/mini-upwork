"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  User, 
  Wallet, 
  MessageSquare,
  Settings,
  ChevronRight
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const bgGradient = "bg-linear-to-r from-violet-600 to-cyan-500";

  const menuItems = [
    { label: "Tổng quan", href: "/dashboard/freelancer", icon: <LayoutDashboard size={20} /> },
    { label: "Tìm việc làm", href: "/jobs", icon: <Search size={20} /> },
    { label: "Đơn ứng tuyển", href: "/dashboard/freelancer/applications", icon: <FileText size={20} /> },
    { label: "Tin nhắn", href: "/chat", icon: <MessageSquare size={20} />, badge: 3 },
    { label: "Hồ sơ cá nhân", href: "/dashboard/freelancer/profile", icon: <User size={20} /> },
    { label: "Thu nhập", href: "/dashboard/freelancer/earnings", icon: <Wallet size={20} /> },
  ];

  return (
    <aside className="w-72 h-screen sticky top-0 bg-white border-r border-slate-100 flex flex-col hidden lg:flex">
      {/* Brand Logo - Nhắc lại từ Navbar */}
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3">
          <div className={`w-8 h-8 ${bgGradient} rounded-lg flex items-center justify-center text-white font-bold`}>
            F
          </div>
          <span className="font-bold text-xl tracking-tight bg-linear-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
            FreelanceHub
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1">
        <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Menu Freelancer
        </p>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                isActive 
                ? `${bgGradient} text-white shadow-lg shadow-violet-100` 
                : "text-slate-600 hover:bg-slate-50 hover:text-violet-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-violet-600"}`}>
                  {item.icon}
                </span>
                <span className="font-semibold text-[15px]">{item.label}</span>
              </div>
              
              {item.badge && !isActive && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}

              {isActive && <ChevronRight size={16} className="opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Settings & User Profile Quick View */}
      <div className="p-4 border-t border-slate-50 space-y-2">
        <Link 
          href="/dashboard/settings" 
          className="flex items-center gap-3 px-4 py-3 text-slate-500 font-medium hover:text-violet-600 transition"
        >
          <Settings size={20} />
          <span>Cài đặt</span>
        </Link>
        
        <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
            {/* Ảnh đại diện giả lập */}
            <div className={`w-full h-full ${bgGradient} opacity-20`}></div>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">Nguyễn Freelancer</p>
            <p className="text-[11px] text-emerald-500 font-bold uppercase">Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
}