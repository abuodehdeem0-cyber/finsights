"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

interface ChartDataPoint {
  time: string;
  value: number;
  high?: number;
  low?: number;
  volume?: number;
}

interface MarketChartProps {
  data?: ChartDataPoint[];
  symbol?: string;
  currency?: string;
  loading?: boolean;
  color?: string;
}

const defaultData: ChartDataPoint[] = [
  { time: "09:30", value: 4750 },
  { time: "10:00", value: 4765 },
  { time: "10:30", value: 4755 },
  { time: "11:00", value: 4770 },
  { time: "11:30", value: 4780 },
  { time: "12:00", value: 4775 },
  { time: "12:30", value: 4785 },
  { time: "13:00", value: 4783 },
  { time: "13:30", value: 4790 },
  { time: "14:00", value: 4788 },
  { time: "14:30", value: 4795 },
  { time: "15:00", value: 4783 },
  { time: "15:30", value: 4780 },
  { time: "16:00", value: 4783 },
];

// Dark theme custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-noir-dark/95 border border-noir-crimson/50 rounded-lg p-3 shadow-xl shadow-noir-crimson/20">
        <p className="text-noir-gray-dark text-sm mb-1">{label}</p>
        <p className="text-noir-gray font-bold text-lg">
          {data.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {data.volume && (
          <p className="text-noir-gray-darker text-xs mt-1">
            Vol: {(data.volume / 1000000).toFixed(1)}M
          </p>
        )}
      </div>
    );
  }
  return null;
}

export function MarketChart({ 
  data = defaultData, 
  symbol = "S&P 500",
  currency = "USD",
  loading = false,
  color = "#6b1515"
}: MarketChartProps) {
  // Calculate min/max for Y domain with padding
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1;
  
  // Generate gradient ID based on symbol to avoid conflicts
  const gradientId = `gradient-${symbol.replace(/[^a-zA-Z0-9]/g, '')}`;
  
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-noir-crimson animate-spin mb-4" />
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-noir-crimson rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-noir-crimson rounded-full animate-pulse delay-100" />
            <div className="w-2 h-2 bg-noir-crimson rounded-full animate-pulse delay-200" />
          </div>
          <p className="text-noir-gray-dark text-sm mt-3">Loading market data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(74, 15, 15, 0.2)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            stroke="#4a4a4a"
            tick={{ fill: "#8a8a8a", fontSize: 11 }}
            axisLine={{ stroke: "rgba(74, 15, 15, 0.3)" }}
            tickLine={{ stroke: "rgba(74, 15, 15, 0.3)" }}
            minTickGap={30}
          />
          <YAxis
            domain={[minValue - padding, maxValue + padding]}
            stroke="#4a4a4a"
            tick={{ fill: "#8a8a8a", fontSize: 11 }}
            axisLine={{ stroke: "rgba(74, 15, 15, 0.3)" }}
            tickLine={{ stroke: "rgba(74, 15, 15, 0.3)" }}
            tickFormatter={(value) => value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
