"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A]">Reports</h1>
        <p className="text-[#64748B] mt-1">View project reports and analytics</p>
      </div>

      <Card>
        <CardContent className="py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F1F5F9] rounded-2xl mb-4">
            <BarChart3 className="w-8 h-8 text-[#64748B]" />
          </div>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Coming Soon</h3>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto">
            Advanced reporting features will be implemented in a future phase.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

