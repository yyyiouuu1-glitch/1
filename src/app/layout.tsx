import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "壹品整装 · 员工平台",
  description: "顾问在手机上见面、签单、留下证据。公司在电脑上整理素材和楼盘。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-white text-apple-text antialiased">{children}</body>
    </html>
  );
}
