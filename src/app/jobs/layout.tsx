import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tìm kiếm công việc',
  description: 'Khám phá và ứng tuyển vào các công việc phù hợp với kỹ năng của bạn',
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}