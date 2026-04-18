import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng bài công việc mới',
  description: 'Tạo và đăng bài công việc mới để tìm kiếm freelancer phù hợp với dự án của bạn',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}