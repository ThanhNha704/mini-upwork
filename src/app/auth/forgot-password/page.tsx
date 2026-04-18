"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [isSent, setIsSent] = useState(false); // Trạng thái đã gửi email thành công

    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        // Giả lập logic gửi mail reset mật khẩu
        setIsSent(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 border border-gray-100">

                {/* Nút Quay lại Đăng nhập */}
                <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 transition mb-8 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Quay lại Đăng nhập
                </Link>

                {!isSent ? (
                    <>
                        {/* Giao diện nhập Email */}
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-[#1E1B4B]">Quên mật khẩu?</h2>
                            <p className="text-gray-500 mt-2 italic text-sm">
                                Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                            </p>
                        </div>

                        <form onSubmit={handleReset} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Địa chỉ Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="example@gmail.com"
                                        className="w-full pl-12 pr-4 py-3.5 text-black placeholder:text-gray-300 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-violet-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-linear-to-r from-violet-600 to-cyan-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-violet-200 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                Gửi hướng dẫn <Send size={18} />
                            </button>
                        </form>
                    </>
                ) : (
                    /* Giao diện sau khi gửi Email thành công */
                    <div className="text-center py-4 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1E1B4B] mb-3">Kiểm tra Email</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8">
                            Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến email của bạn.
                            Vui lòng kiểm tra cả hòm thư rác nếu không thấy.
                        </p>
                        <button
                            onClick={() => setIsSent(false)}
                            className="text-violet-600 font-bold hover:underline text-sm"
                        >
                            Gửi lại email khác
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}