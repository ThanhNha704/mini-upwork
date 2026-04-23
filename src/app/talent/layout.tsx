import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tìm kiếm tài năng',
  description: 'Khám phá và kết nối với những tài năng hàng đầu trên nền tảng của chúng tôi',
}

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}