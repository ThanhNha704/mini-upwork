'use client'

import { useState } from 'react'
import { createClient } from '@/src/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      setMessage(`Lỗi: ${error.message}`)
    } else {
      // Chuyển hướng sang trang nhập OTP để reset
      router.push(`/resetpw?email=${encodeURIComponent(email)}`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="bg-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-white/20">
        <h2 className="text-3xl font-bold mb-6 text-center">Quên Mật Khẩu</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">Nhập email để nhận mã OTP khôi phục.</p>
        <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
          <input type="email" placeholder="Địa chỉ Email" required value={email} onChange={e => setEmail(e.target.value)}
            className="p-3 rounded-lg bg-white/20 border border-black/10 outline-none text-black placeholder:text-gray-300 focus:bg-white/30 transition" />
          <button type="submit" disabled={loading} className="w-full py-4 bg-linear-to-r from-violet-600 to-cyan-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
            {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm font-medium bg-black/30 text-white p-3 rounded-lg">{message}</p>}
      </div>
    </div>
  )
}