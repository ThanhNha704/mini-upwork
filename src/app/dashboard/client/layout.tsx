import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tổng quan',
  description: 'Trang tổng quan cho Client',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}