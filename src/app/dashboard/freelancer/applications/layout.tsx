import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Việc làm đã ứng tuyển',
  description: 'Xem lại các công việc mà bạn đã ứng tuyển và theo dõi tiến trình của chúng',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}