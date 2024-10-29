"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";

const TopBar = () => {
  const { isMobile, state, open, openMobile } = useSidebar();

return <div className="flex flex-row p-2 gap-2">
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
}

export default TopBar;