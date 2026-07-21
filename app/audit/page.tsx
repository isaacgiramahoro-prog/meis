"use client";

import { useAuth } from "@/lib/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Shield } from "lucide-react";

export default function AuditPage() {
  const { user } = useAuth();

  // Only Admin can access
  if (user?.role !== "ADMIN") {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-16 text-center">
            <Shield className="w-12 h-12 text-[#DC2626] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">Access Denied</h2>
            <p className="text-sm text-[#64748B]">You do not have permission to view this page.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A]">Audit Log</h1>
        <p className="text-[#64748B] mt-1">View system activity and change history</p>
      </div>

      <Card>
        <CardContent className="py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F1F5F9] rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-[#64748B]" />
          </div>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Coming Soon</h3>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto">
            Audit logging features will be implemented in a future phase.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

