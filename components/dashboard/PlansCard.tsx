"use client";

import { Star } from "lucide-react";

export default function PlansCard() {
  return (
    <div
      className="flex flex-col gap-3 p-6 rounded-2xl"
      style={{
        background: "linear-gradient(180deg, #1e1e1e 0%, #0e0e0e 100%)",
        border: "1px solid rgba(72,69,83,0.2)",
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "rgba(203,190,255,0.2)" }}
      >
        <Star className="w-5 h-5" style={{ color: "#cbbeff" }} />
      </div>
      <div>
        <h4 className="font-bold text-[14px] text-white">Editorial Pro Plan</h4>
        <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "#938e9e" }}>
          Desbloquea SEO analytics avanzado, créditos IA ilimitados y módulos premium.
        </p>
      </div>
      <button
        className="w-full py-2 rounded-lg font-bold text-[12px] transition-all"
        style={{ background: "#cbbeff", color: "#1e0061" }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        Ver planes
      </button>
    </div>
  );
}
