"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  title: string;
  data: DataPoint[];
  height?: number;
}

export function BarChart({ title, data, height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-3" style={{ height }}>
          {data.map((item) => {
            const barHeight = (item.value / maxValue) * (height - 20);
            return (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-[#0F172A]">
                  {item.value}
                </span>
                <div
                  className="w-full rounded-md transition-all duration-500"
                  style={{
                    height: `${Math.max(barHeight, 4)}px`,
                    backgroundColor: item.color,
                  }}
                />
                <span className="text-[10px] text-[#64748B] text-center truncate w-full">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface DonutChartProps {
  title: string;
  data: DataPoint[];
  size?: number;
}

export function DonutChart({ title, data, size = 180 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth={20}
            />
            {/* Data segments */}
            {data.map((item) => {
              const percent = item.value / total;
              const strokeDasharray = `${percent * circumference} ${circumference * (1 - percent)}`;
              const rotate = cumulativePercent * 360;
              cumulativePercent += percent;

              return (
                <circle
                  key={item.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={20}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={-rotate * (Math.PI / 180) * radius}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  className="transition-all duration-500"
                />
              );
            })}
            {/* Center text */}
            <text
              x={size / 2}
              y={size / 2 - 6}
              textAnchor="middle"
              className="text-2xl font-bold"
              fill="#0F172A"
              fontSize="24"
            >
              {total}
            </text>
            <text
              x={size / 2}
              y={size / 2 + 14}
              textAnchor="middle"
              className="text-xs"
              fill="#64748B"
              fontSize="11"
            >
              Total
            </text>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 justify-center">
            {data.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-[#64748B]">
                  {item.label} — {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardData {
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

interface StatusBarProps {
  title: string;
  data: StatCardData[];
}

export function StatusBarChart({ title, data }: StatusBarProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stacked bar */}
          <div className="w-full h-8 bg-[#F1F5F9] rounded-lg overflow-hidden flex">
            {data.map((item) => {
              const width = (item.value / total) * 100;
              return (
                <div
                  key={item.label}
                  style={{
                    width: `${width}%`,
                    backgroundColor: item.color,
                  }}
                  className="h-full transition-all duration-500 first:rounded-l-lg last:rounded-r-lg"
                  title={`${item.label}: ${item.value}`}
                />
              );
            })}
          </div>

          {/* Legend items */}
          <div className="grid grid-cols-2 gap-3">
            {data.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 p-2 rounded-lg"
                style={{ backgroundColor: `${item.color}10` }}
              >
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#0F172A]">
                    {item.value}
                  </p>
                  <p className="text-[10px] text-[#64748B] truncate">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

