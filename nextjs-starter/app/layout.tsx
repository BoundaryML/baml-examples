import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react18-json-view/src/style.css";
import { NavBar } from "./_components/navbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
            <div className="flex flex-row p-2 gap-2">
              <SidebarTrigger />
              <div className="text-muted-foreground flex items-center justify-center  text-center whitespace-nowrap">
                These examples are built with{" "}
                <Link
                  href={"https://docs.boundaryml.com"}
                  className="px-1 underline text-blue-600"
                  target="_blank"
                >
                  {" "}
                  BAML
                </Link>{" "}
              </div>
            </div>
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
