"use client";

import { motion } from "framer-motion";

const MOCK = [
  { sym: "BTC", price: "98,420", chg: "+1.2%" },
  { sym: "ETH", price: "3,410", chg: "-0.4%" },
  { sym: "SPX", price: "5,842", chg: "+0.3%" },
  { sym: "SOL", price: "178", chg: "+2.1%" },
  { sym: "BNB", price: "612", chg: "+0.1%" },
];

export function TickerBar() {
  const items = [...MOCK, ...MOCK, ...MOCK];
  return (
    <div className="border-b border-white/10 bg-[#0A0F1E] text-sm text-zinc-300">
      <div className="overflow-hidden">
        <motion.div
          className="flex w-max gap-10 py-2"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          {items.map((m, i) => (
            <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap">
              <span className="font-medium text-zinc-100">{m.sym}</span>
              <span className="text-zinc-400">{m.price} USD</span>
              <span
                className={
                  m.chg.startsWith("+") ? "text-emerald-400" : "text-red-400"
                }
              >
                {m.chg}
              </span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
