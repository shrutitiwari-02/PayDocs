import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PayDocs | Accounting & Document Toolkit",
  description: "Professional accounting and document toolkit for payroll and invoicing.",
  icons: {
    icon: "/logo-icon.png?v=2",
    apple: "/logo-icon.png?v=2",
  },
};

import { SessionProvider } from "@/components/providers/SessionProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col`}>
        <SessionProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
