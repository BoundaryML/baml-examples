import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react18-json-view/src/style.css";
import NavBar from "./_components/navbar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Link from "next/link";
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
      <body>
        <SidebarProvider>
          <AppSidebar />
          <main className="flex flex-col w-full h-full overflow-x-clip overflow-y-auto">
            <NavBar />
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
