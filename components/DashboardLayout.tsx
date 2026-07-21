"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main
        className={cn(
          "transition-all duration-300",
          "lg:ml-[260px]",
          "min-h-screen"
        )}
      >
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}

