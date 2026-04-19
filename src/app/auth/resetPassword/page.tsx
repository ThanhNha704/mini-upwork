'use client'
import { useState, Suspense } from 'react'
import { createClient } from '@/src/utils/supabase/client'
import { redirect, useRouter, useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, Mail } from 'lucide-react'

function ResetForm() {
  const searchParams = useSearchParams()
  const defaultEmail = searchParams.get('email') || ''

  const [email, setEmail] = useState(defaultEmail)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState({ text: '', isError: false })
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Xác thực OTP
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery'
    })

    if (verifyError) {
      setMessage({ text: 'Mã OTP không hợp lệ hoặc đã hết hạn.', isError: true })
      return
    }

    // 2. Cập nhật mật khẩu mới
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      setMessage({ text: `Lỗi cập nhật: ${updateError.message}`, isError: true })
    } else {
      setMessage({ text: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', isError: false })
      router.push('/auth/login')
    }
  }

  return (
    <form onSubmit={handleReset} className="flex flex-col gap-5">
      <div>{message.text && <p className={`text-center text-sm p-2 rounded-lg ${message.isError ? 'bg-red-500/30' : 'bg-green-500/30'}`}>{message.text}</p>}</div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500 ml-1">Đang đặt lại mật khẩu cho:</label>
        <div className="relative">
          <Mail className="absolute left-4 top-5 text-slate-400" size={18} />
          <div className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none">
            {email}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500 ml-1">Mật khẩu mới:</label>
        <div className="relative">
          <Lock className="absolute left-4 top-4 text-slate-400" size={18} />
          <input
            required
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-violet-500 transition-all"
            value={newPassword} onChange={e => setNewPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4 text-gray-400 hover:text-violet-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500 ml-1">Mã OTP:</label>
        <input type="text" className="w-full text-center text-2xl tracking-[0.5em] py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-violet-500 font-bold"
          placeholder="00000000"
          required
          maxLength={8}
          autoComplete='one-time-code'
          value={otp}
          onChange={e => setOtp(e.target.value)}
        />
      </div>
      <button type="submit" className="w-full py-4 bg-linear-to-r from-violet-600 to-cyan-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
        Đổi mật khẩu
      </button>
      <button
        type="button"
        onClick={() => {
          redirect('/auth/login');
        }}
        className="text-sm text-slate-400 font-medium hover:underline"
      >
        Quay lại đăng nhập
      </button>
    </form>
  )
}

export default function ResetPassword() {
  return (
    <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-xl w-full max-w-md shadow-2xl border border-white/20 mx-auto my-20">
      <h2 className="text-3xl font-bold mb-6 text-center">Tạo Mật Khẩu Mới</h2>
      <Suspense fallback={<p>Đang tải...</p>}>
        <ResetForm />
      </Suspense>
    </div>
  )
}