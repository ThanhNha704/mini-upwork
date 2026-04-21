import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quản lý công việc',
  description: 'Quản lý và theo dõi các công việc của bạn trên FreelanceHub',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}