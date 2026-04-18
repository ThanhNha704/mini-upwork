"use client";

import { useState } from "react";
import { createClient } from "@/src/utils/supabase/client";
import { verifyOtpAction } from "@/src/app/services/authActions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, ShieldCheck, RefreshCcw, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [authData, setAuthData] = useState({ email: "", password: "", otp: "" });
  const [step, setStep] = useState<'login' | 'verify'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: true });
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const updateData = (key: string, value: string) => setAuthData(prev => ({ ...prev, [key]: value }));

  const handleRedirect = (user: any) => {
    const role = user?.user_metadata?.role;
    const paths: Record<string, string> = {
      FREELANCER: "/dashboard/freelancer",
      CLIENT: "/dashboard/client/manage-jobs"
    };
    router.push(paths[role] || "/profile");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', isError: true });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: authData.email,
      password: authData.password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        await supabase.auth.resend({ type: 'signup', email: authData.email });
        setMessage({ text: "Tài khoản chưa xác nhận. Mã OTP đã được gửi!", isError: false });
        setStep('verify');
      } else {
        setMessage({ text: "Email hoặc mật khẩu không đúng.", isError: true });
      }
    } else handleRedirect(data.user);
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await verifyOtpAction(supabase, authData.email, authData.otp);
    if (error) {
      setMessage({ text: `Lỗi: ${error.message}`, isError: true });
      setLoading(false);
    } else if (data.user) handleRedirect(data.user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-4xl shadow-xl p-8 border border-gray-100">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-r from-violet-600 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {step === 'login' ? 'F' : <ShieldCheck size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{step === 'login' ? "Đăng nhập" : "Xác thực OTP"}</h2>
          <p className="text-slate-500 text-sm mt-1">{step === 'login' ? "Chào mừng bạn trở lại" : `Mã đã gửi đến email của bạn`}</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 border-l-4 rounded-xl text-xs font-bold flex items-center gap-3 ${message.isError ? 'bg-red-50 border-red-500 text-red-700' : 'bg-green-50 border-green-500 text-green-700'}`}>
            <AlertCircle size={18} /> {message.text}
          </div>
        )}

        {step === 'login' ? (
          <form className="space-y-4" onSubmit={handleLogin}>

            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-400" size={18} />
              <input type="email" required placeholder="Email" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-violet-500 transition-all"
                value={authData.email} onChange={e => updateData('email', e.target.value)} />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-400" size={18} />
              <input 
              required 
              type={showPassword ? "text" : "password"} 
              placeholder="Mật khẩu" 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-violet-500 transition-all"
                value={authData.password} onChange={e => updateData('password', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-violet-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="text-right px-1">
              <Link href="/auth/forgotpw" className="text-sm font-bold text-violet-600 hover:text-cyan-500 transition-colors hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-linear-to-r from-violet-600 to-cyan-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : <>Đăng nhập <ArrowRight size={18} /></>}
            </button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleVerify}>
            <input type="text" required placeholder="00000000" className="w-full text-center text-3xl tracking-[0.5em] py-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl outline-none focus:border-cyan-500 font-bold"
              value={authData.otp} onChange={e => updateData('otp', e.target.value)} />
            <button type="submit" disabled={loading} className="w-full py-4 bg-linear-to-r from-violet-600 to-cyan-500 text-white font-bold rounded-2xl flex items-center justify-center disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : "Xác thực ngay"}
            </button>
            <div className="flex flex-col gap-3 text-center">
              <button
                type="button"
                disabled={loading}
                onClick={async () => { setLoading(true); await supabase.auth.resend({ type: 'signup', email: authData.email }); setLoading(false); }}
                className="text-sm font-bold text-violet-600 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Đang gửi..." : "Gửi lại mã"}
              </button>
              <button type="button" onClick={() => setStep('login')} className="text-sm text-slate-400 font-medium hover:underline">Quay lại đăng nhập</button>
            </div>
          </form>
        )}

        <div className="text-center mt-8 pt-6 border-t border-slate-100 text-sm text-slate-500">
          Chưa có tài khoản? <Link href="/auth/register" className="text-violet-600 font-bold hover:text-cyan-500 hover:underline">Đăng ký</Link>
        </div>
      </div>
    </div>
  );
}