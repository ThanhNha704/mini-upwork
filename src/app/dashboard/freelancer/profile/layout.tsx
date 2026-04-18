import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hồ sơ của bạn',
  description: 'Xem và cập nhật thông tin hồ sơ của bạn',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}