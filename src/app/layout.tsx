import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/src/components/shared/Navbar";
import { Footer } from "@/src/components/shared/Footer";
import { createClient } from "../utils/supabase/server";

export const metadata: Metadata = {
  title: {
    template: '%s | FreelanceHub', 
    default: 'FreelanceHub - Nền tảng Freelancer',
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
