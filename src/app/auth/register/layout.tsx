import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng ký',
  description: 'Tạo tài khoản mới trên FreelanceHub và bắt đầu hành trình làm việc tự do của bạn',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}