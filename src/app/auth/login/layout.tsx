import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Tham gia FreelanceHub ngay hôm nay',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}