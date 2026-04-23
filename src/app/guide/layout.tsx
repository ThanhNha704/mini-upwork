import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hướng dẫn sử dụng',
  description: 'Tìm hiểu cách sử dụng nền tảng của chúng tôi một cách hiệu quả',
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}