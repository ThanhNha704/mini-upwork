import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tài chính',
  description: 'Trang theo dõi tài chính cho Client',
}

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}