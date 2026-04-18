import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tin nhắn',
  description: 'Trò chuyện với khách hàng và nhà cung cấp dịch vụ của bạn',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}