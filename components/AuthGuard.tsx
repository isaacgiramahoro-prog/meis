"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const publicPaths = ["/signin", "/signup", "/"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (user && publicPaths.includes(pathname)) {
      // Redirect authenticated users away from auth pages
      router.push(user.role === "ADMIN" ? "/dashboard" : "/projects");
    }

    if (!user && !publicPaths.includes(pathname)) {
      // Redirect unauthenticated users to sign in
      router.push("/signin");
    }
  }, [user, loading, pathname, router]);

  // Show nothing while loading auth state on protected pages
  if (loading && !publicPaths.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#64748B] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

