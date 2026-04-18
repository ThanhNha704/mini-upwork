import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quên Mật Khẩu',
  description: 'Khôi phục mật khẩu của bạn và tiếp tục hành trình làm việc tự do trên FreelanceHub',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}