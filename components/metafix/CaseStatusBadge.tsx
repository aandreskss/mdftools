import type { MetafixStatus } from "@/types";

const config: Record<MetafixStatus, { label: string; classes: string }> = {
  open:        { label: "Abierto",     classes: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  in_progress: { label: "En progreso", classes: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  resolved:    { label: "Resuelto",    classes: "bg-green-500/10 text-green-400 border-green-500/20" },
};

export default function CaseStatusBadge({ status }: { status: MetafixStatus }) {
  const { label, classes } = config[status] ?? config.open;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${classes}`}>
      {label}
    </span>
  );
}
