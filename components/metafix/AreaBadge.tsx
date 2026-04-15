import type { MetafixArea } from "@/types";

const labels: Record<MetafixArea | "general", string> = {
  waba:             "WABA",
  meta_ads:         "Meta Ads",
  catalogs:         "Catálogos",
  business_manager: "Business Manager",
  pixel:            "Píxel",
  other:            "Otro",
  general:          "General",
};

export default function AreaBadge({ area }: { area: MetafixArea | "general" | null }) {
  if (!area) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1a2535] text-[#60a5fa] border border-blue-500/15">
      {labels[area] ?? area}
    </span>
  );
}
