import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/src/app/components/shared/Navbar";
import { Footer } from "@/src/app/components/shared/Footer";
import { createClient } from "../utils/supabase/server";

export const metadata: Metadata = {
  title: {
    template: '%s | FreelanceHub', // %s sẽ được thay thế bởi title của trang con
    default: 'FreelanceHub - Nền tảng Freelancer', // Tiêu đề mặc định nếu trang con không có title
  },
  description: 'Kết nối Freelancer tài năng',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const supabase = createClient();

  return (
    <html lang="en">
      <body>

        <Navbar />

        {children}

        <Footer />

      </body>
    </html>
  );
}
