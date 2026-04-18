import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = "USD"): string {
  const symbol = currency === "SAR" ? "ر.س" : "$";
  const rate = currency === "SAR" ? 3.75 : 1;
  const convertedValue = value * rate;
  
  return `${symbol}${convertedValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function calculateRiskLevel(volatility: number): {
  level: "Low" | "Medium" | "High";
  color: string;
  factors: string[];
} {
  if (volatility < 15) {
    return {
      level: "Low",
      color: "text-signal-buy",
      factors: [
        "Stable price movement over 30 days",
        "Low beta relative to market",
        "Consistent trading volume",
        "Strong institutional backing",
        "Established dividend history",
      ],
    };
  } else if (volatility < 30) {
    return {
      level: "Medium",
      color: "text-signal-hold",
      factors: [
        "Moderate price swings within expected range",
        "Average market correlation",
        "Sector-specific volatility present",
        "Earnings-driven fluctuations",
        "Moderate liquidity concerns",
      ],
    };
  } else {
    return {
      level: "High",
      color: "text-signal-sell",
      factors: [
        "Significant intraday price movements",
        "High beta indicating market sensitivity",
        "Low liquidity causing slippage",
        "Recent news-driven volatility",
        "Elevated options activity",
      ],
    };
  }
}

export function getSignalColor(signal: "BUY" | "SELL" | "HOLD"): string {
  switch (signal) {
    case "BUY":
      return "bg-signal-buy";
    case "SELL":
      return "bg-signal-sell";
    case "HOLD":
      return "bg-signal-hold";
    default:
      return "bg-noir-grayDark";
  }
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 75) return "text-signal-buy";
  if (confidence >= 50) return "text-signal-hold";
  return "text-signal-sell";
}
