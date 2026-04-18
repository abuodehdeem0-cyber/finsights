"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const tickerData = [
  { symbol: "AAPL", price: 185.92, change: 2.34 },
  { symbol: "MSFT", price: 374.58, change: 0.95 },
  { symbol: "GOOGL", price: 141.8, change: -0.45 },
  { symbol: "AMZN", price: 153.42, change: 1.23 },
  { symbol: "TSLA", price: 248.5, change: -1.87 },
  { symbol: "NVDA", price: 495.22, change: 4.12 },
  { symbol: "META", price: 353.45, change: 0.78 },
  { symbol: "2222.SR", price: 29.85, change: 0.32 },
  { symbol: "7010.SR", price: 62.4, change: -0.15 },
  { symbol: "1120.SR", price: 9.12, change: 1.05 },
];

export function StockTicker() {
  return (
    <div className="relative overflow-hidden py-4 mb-8 border-y border-noir-crimson/30 bg-noir-dark/50">
      <motion.div
        animate={{ x: [0, -1920] }}
        transition={{
          x: {
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          },
        }}
        className="flex space-x-8 whitespace-nowrap"
      >
        {[...tickerData, ...tickerData, ...tickerData].map((stock, index) => (
          <div key={`${stock.symbol}-${index}`} className="flex items-center space-x-3">
            <span className="font-semibold text-noir-gray">{stock.symbol}</span>
            <span className="text-noir-gray-dark">
              {formatCurrency(stock.price)}
            </span>
            <span
              className={`flex items-center text-sm ${
                stock.change >= 0 ? "text-signal-buy" : "text-signal-sell"
              }`}
            >
              {stock.change >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {stock.change >= 0 ? "+" : ""}
              {stock.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </motion.div>
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-noir-black to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-noir-black to-transparent z-10" />
    </div>
  );
}
