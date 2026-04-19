import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đặt lại mật khẩu',
  description: 'Nhập email và mã OTP để đặt lại mật khẩu của bạn trên FreelanceHub',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}