"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/utils/supabase/client";
import { verifyOtpAction } from "@/src/actions/authActions";
import { User, Mail, Lock, Briefcase, Loader2, ArrowRight, Eye, EyeOff, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "FREELANCER",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", formData.email)
        .maybeSingle();

      if (existingUser) {
        setError("Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.");
        setLoading(false);
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: formData.role,
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("Tài khoản đã tồn tại trong hệ thống xác thực. Vui lòng đăng nhập.");
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      setMessage("Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra.");
      setStep('verify');

    } catch (err) {
      setError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { data, error } = await verifyOtpAction(supabase, formData.email, otp);

    if (error) {
      setError(`Xác thực thất bại: ${error.message}`);
    } else if (data.user) {
      router.push('/auth/login');
    }
    setLoading(false);
  };

  // Gửi lại OTP mới
  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: formData.email,
    });

    if (error) {
      setError(`Gửi lại mã thất bại: ${error.message}`);
    } else {
      setMessage("Mã OTP mới đã được gửi vào email của bạn.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#1E1B4B]">
            {step === 'register' ? "Tạo tài khoản" : "Xác thực Email"}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {step === 'register' ? "Tham gia cộng đồng FreelanceHub ngay" : "Nhập mã OTP đã được gửi đến email"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 text-violet-600 text-xs rounded-xl text-center font-medium">
            {message}
          </div>
        )}

        {step === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "FREELANCER" })}
                className={`p-3 rounded-2xl border-2 transition flex flex-col items-center gap-1 ${formData.role === "FREELANCER"
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-gray-100 text-gray-400"
                  }`}
              >
                <User size={20} />
                <span className="text-[10px] font-bold">Freelancer</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "CLIENT" })}
                className={`p-3 rounded-2xl border-2 transition flex flex-col items-center gap-1 ${formData.role === "CLIENT"
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-gray-100 text-gray-400"
                  }`}
              >
                <Briefcase size={20} />
                <span className="text-[10px] font-bold">Khách hàng</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                required
                placeholder="Họ"
                className="p-4 text-black bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-violet-500"
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <input
                required
                placeholder="Tên"
                className="p-4 text-black bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-violet-500"
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={18} />
              <input
                required
                type="email"
                placeholder="Email"
                className="w-full pl-12 pr-4 py-4 text-black bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-violet-500"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-400" size={18} />
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                className="w-full pl-12 pr-12 py-4 text-black bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-violet-500"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400 hover:text-violet-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-linear-to-r from-violet-600 to-cyan-500 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Đăng ký ngay"}
              {!loading && <ArrowRight size={18} />}
            </button>

            <div className="text-center text-sm text-gray-500 mt-4">
              Đã có tài khoản?{" "}
              <Link href="/auth/login" className="text-violet-600 font-semibold hover:underline">
                Đăng nhập
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-5">
            <input
              type="text"
              placeholder="00000000"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="p-4 rounded-2xl bg-gray-50 border border-gray-200 outline-none text-black text-center text-2xl tracking-[0.5em] focus:border-violet-500 transition font-bold"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 text-white p-4 rounded-2xl font-bold transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Xác nhận OTP"}
            </button>

            {/* NÚT GỬI LẠI MÃ OTP */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={handleResendOtp}
                className="text-sm font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-2 disabled:opacity-50 transition"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Gửi lại mã OTP mới
              </button>

              <button
                type="button"
                onClick={() => setStep('register')}
                className="text-sm text-gray-500 hover:text-violet-600"
              >
                Quay lại trang đăng ký
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}