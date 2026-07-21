"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  iconBg?: string;
  iconColor?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  iconBg = "bg-[#DBEAFE]",
  iconColor = "text-[#1E3A8A]",
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#64748B]">{title}</p>
            <p className="text-3xl font-bold text-[#0F172A]">{value}</p>
            {description && (
              <p className="text-xs text-[#94A3B8]">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.positive ? "text-[#16A34A]" : "text-[#DC2626]"
                  )}
                >
                  {trend.positive ? "↑" : "↓"} {trend.value}
                </span>
                <span className="text-xs text-[#94A3B8]">vs last month</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
              iconBg
            )}
          >
            <div className={cn("w-5 h-5", iconColor)}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

