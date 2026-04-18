import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thu nhập của bạn',
  description: 'Xem lại thu nhập từ các công việc bạn đã hoàn thành và theo dõi các khoản thanh toán của bạn',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}