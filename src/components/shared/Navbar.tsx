'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/src/utils/supabase/client'
import {
    Menu, X, LogOut, MessageSquare,
    Briefcase, PlusCircle, Bell, User as UserIcon
} from 'lucide-react'

export const Navbar = () => {
    const pathname = usePathname()
    const supabase = createClient()

    // State quản lý thông tin người dùng (Giống Profile.tsx)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<{ full_name: string, avatar_url: string, role: string } | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    // Mỗi khi pathname thay đổi (chuyển trang), đóng menu ngay lập tức
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    useEffect(() => {
        async function getAuthAndProfile() {
            // 1. Lấy user đang đăng nhập
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                // 2. Lấy thông tin chi tiết từ bảng users (y hệt Profile)
                const { data } = await supabase
                    .from('users')
                    .select('full_name, avatar_url, role')
                    .eq('id', user.id)
                    .single()

                if (data) setProfile(data)
            }
            setLoading(false)
        }

        getAuthAndProfile()

        // Lắng nghe sự kiện đăng nhập/đăng xuất để cập nhật Navbar ngay lập tức
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null)
                setProfile(null)
            } else if (event === 'SIGNED_IN') {
                getAuthAndProfile()
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await (await supabase).auth.signOut()
        window.location.href = '/' // Load lại trang để xóa sạch state
    }

    // Cấu hình Menu
    const navLinks = {
        GUEST: [
            { label: "Trang chủ", href: "/" },
            { label: "Tìm việc làm", href: "/jobs" },
            { label: "Tìm tài năng", href: "/talent" },
            { label: "Hướng dẫn", href: "/guide" },
        ],
        FREELANCER: [
            { label: "Tổng quan", href: "/dashboard/freelancer", icon: <Briefcase size={18} /> },
            { label: "Tìm việc", href: "/jobs", icon: <Briefcase size={18} /> },
            { label: "Việc đã apply", href: "/dashboard/freelancer/applications" },
            { label: "Thu nhập", href: "/dashboard/freelancer/earnings" },
        ],
        CLIENT: [
            { label: "Quản lý dự án", href: "/dashboard/client/manage-jobs" },
            { label: "Đăng dự án", href: "/dashboard/client/post-job", icon: <PlusCircle size={18} /> },
            { label: "Tìm Freelancer", href: "/talent" },
        ]
    };

    const activeLinks = !user ? navLinks.GUEST : (profile?.role === 'CLIENT' ? navLinks.CLIENT : navLinks.FREELANCER)
    const bgGradient = "bg-linear-to-br from-violet-600 to-cyan-500"
    const textGradient = "bg-linear-to-br from-violet-600 to-cyan-500 bg-clip-text text-transparent"

    return (
        <nav className="sticky top-0 left-0 w-full z-50 bg-white backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">

                    {/* LOGO */}
                    <div className="flex items-center gap-2 group">
                        <div className={`w-10 h-10 ${bgGradient} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>F</div>
                        <span className={`text-2xl font-extrabold tracking-tighter hidden sm:block ${textGradient}`}>FreelanceHub</span>
                    </div>

                    {/* MENU CHÍNH (Desktop) */}
                    <div className="hidden md:flex items-center space-x-2">
                        {activeLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-2 text-[15px] font-semibold transition-all ${pathname === item.href
                                    ? "text-violet-600 border-b-2 border-violet-600"
                                    : "text-gray-600 hover:text-violet-600 border-b-2 border-white hover:border-violet-600"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* ACTIONS & AUTH */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                {/* Chat & Notification Icons */}
                                {/* <div className="hidden sm:flex items-center gap-1"> */}
                                <div className="flex items-center gap-1">
                                    <Link href="/chat" className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition relative">
                                        <MessageSquare size={22} />
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                    </Link>
                                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
                                        <Bell size={22} />
                                    </button>
                                </div>

                                <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-bold text-gray-900 leading-none">{profile?.full_name || "Người dùng"}</p>
                                    <p className="text-[10px] font-bold text-violet-500 mt-1 uppercase tracking-widest">{profile?.role || 'Thành viên'}</p>
                                </div>

                                {/* Avatar Link */}
                                <Link
                                    href={`/dashboard/${profile?.role?.toLowerCase() || 'freelancer'}/profile`}
                                    className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center hover:ring-2 hover:ring-violet-500 transition-all"
                                >
                                    {profile?.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserIcon size={20} className="text-gray-400" />
                                    )}
                                </Link>

                                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-all">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-3">
                                <Link href="/auth/login" className="px-5 py-2.5 text-[15px] font-bold text-gray-700 hover:text-violet-600">Đăng nhập</Link>
                                <Link href="/auth/register" className={`px-6 py-2.5 rounded-full text-[15px] font-bold text-white shadow-lg ${bgGradient}`}>Đăng ký</Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            {isOpen && (
                <div className="md:hidden bg-white border-t p-4 space-y-2">
                    {activeLinks.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 font-bold hover:bg-violet-50">
                            {item.label}
                        </Link>
                    ))}
                    {user ? (
                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-500 font-bold hover:bg-red-50">
                            Đăng xuất
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <Link href="/auth/login" className="block px-4 py-3 rounded-xl text-gray-700 font-bold hover:bg-violet-50">
                                Đăng nhập
                            </Link>
                            <Link href="/auth/register" className="block px-4 py-3 rounded-xl text-gray-700 font-bold hover:bg-violet-50">
                                Đăng ký
                            </Link>
                        </div>
                    )}

                </div>
            )}
        </nav>
    )
}