"use client";
import React from "react";
import AgentBrain from "@/components/AgentBrain";

interface AgentPageHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  agentId: string;
  children?: React.ReactNode;
  extraActions?: React.ReactNode;
}

export default function AgentPageHeader({
  title,
  description,
  icon,
  iconBg,
  iconColor,
  agentId,
  children,
  extraActions,
}: AgentPageHeaderProps) {
  return (
    <div
      className="relative flex flex-col gap-4 px-6 py-5 flex-shrink-0 overflow-hidden"
      style={{ background: "#1c1b1b", borderBottom: "1px solid rgba(203,190,255,0.08)" }}
    >
      {/* Glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-40%",
          right: "-2%",
          width: "280px",
          height: "260px",
          background: "rgba(203,190,255,0.06)",
          filter: "blur(50px)",
          borderRadius: "50%",
        }}
      />

      {/* Title row */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: iconBg, border: `1px solid ${iconColor}30` }}
          >
            <span style={{ color: iconColor }}>{icon}</span>
          </div>
          <div>
            <h1 className="font-bold text-[17px] text-white leading-tight">{title}</h1>
            <p className="text-[12px]" style={{ color: "#938e9e" }}>
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {extraActions}
          <AgentBrain agentId={agentId} />
        </div>
      </div>

      {/* Options/pills area */}
      {children && (
        <div className="relative flex flex-col sm:flex-row gap-3">{children}</div>
      )}
    </div>
  );
}

export function AgentPills({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[11px] font-medium flex-shrink-0 w-16"
        style={{ color: "#938e9e" }}
      >
        {label}
      </span>
      <div className="flex gap-1 flex-wrap">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
            style={
              value === o
                ? { background: "#cbbeff", color: "#1e0061" }
                : {
                    background: "rgba(255,255,255,0.04)",
                    color: "#938e9e",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }
            }
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
