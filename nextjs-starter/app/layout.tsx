import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "./_components/navbar";
export const dynamic = "force-dynamic";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BAML Examples",
  description: "Examples using the BAML structured prompting language",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className + " overflow-y-clip max-h-screen"}>
        <NavBar />
        <div style={{ height: "calc(100vh - 60px)" }}>{children}</div>
      </body>
    </html>
  );
}
