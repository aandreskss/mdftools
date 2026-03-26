import { BarChart2 } from "lucide-react";

export default function KeywordsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <BarChart2 size={15} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">Keywords</h1>
          <p className="text-xs text-gray-500">Investigación y análisis de palabras clave</p>
        </div>
      </div>
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-2xl border border-gray-800">
        <p className="text-gray-500 text-sm">Módulo de Keywords — próximamente</p>
      </div>
    </div>
  );
}
