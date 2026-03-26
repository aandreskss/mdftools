"use client";

import { useState, useEffect, useRef } from "react";
import {
  Library, X, Upload, Trash2, Play, Loader2, Plus,
  ImageIcon, Film, Tag, StickyNote,
} from "lucide-react";

interface Ad {
  id: string;
  file_name: string;
  file_type: "image" | "video";
  file_size: number;
  platform: string;
  tags: string[];
  notes: string;
  created_at: string;
  url: string;
}

const PLATFORMS = ["Meta", "TikTok", "Google", "YouTube", "LinkedIn", "Otro"];

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const PLATFORM_COLORS: Record<string, string> = {
  Meta: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  TikTok: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  Google: "bg-green-500/15 text-green-400 border-green-500/30",
  YouTube: "bg-red-500/15 text-red-400 border-red-500/30",
  LinkedIn: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  Otro: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export default function AdLibrary() {
  const [open, setOpen] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  // Upload modal
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPlatform, setUploadPlatform] = useState("Meta");
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [uploadTagInput, setUploadTagInput] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load count on mount for badge
  useEffect(() => {
    fetch("/api/ad-library?count=true")
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open) loadAds();
  }, [open]);

  async function loadAds() {
    setLoading(true);
    const res = await fetch("/api/ad-library");
    const data = await res.json();
    const loaded = data.ads ?? [];
    setAds(loaded);
    setCount(loaded.length);
    setLoading(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
    setUploadModal(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function addTag() {
    const tag = uploadTagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !uploadTags.includes(tag)) setUploadTags((prev) => [...prev, tag]);
    setUploadTagInput("");
  }

  function resetUpload() {
    setUploadFile(null);
    setUploadPlatform("Meta");
    setUploadTags([]);
    setUploadTagInput("");
    setUploadNotes("");
    setUploadPreview(null);
    setUploadModal(false);
  }

  async function handleUpload() {
    if (!uploadFile) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", uploadFile);
    fd.append("platform", uploadPlatform);
    fd.append("tags", JSON.stringify(uploadTags));
    fd.append("notes", uploadNotes);

    const res = await fetch("/api/ad-library", { method: "POST", body: fd });
    if (res.ok) {
      const { ad } = await res.json();
      setAds((prev) => [ad, ...prev]);
      setCount((c) => c + 1);
    }
    setUploading(false);
    resetUpload();
  }

  async function handleDelete(adId: string) {
    await fetch(`/api/ad-library?id=${adId}`, { method: "DELETE" });
    setAds((prev) => prev.filter((a) => a.id !== adId));
    setCount((c) => Math.max(0, c - 1));
    if (selectedAd?.id === adId) setSelectedAd(null);
  }

  const platforms = ["Todos", ...Array.from(new Set(ads.map((a) => a.platform)))];
  const filteredAds = filter === "Todos" ? ads : ads.filter((a) => a.platform === filter);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="Biblioteca de anuncios"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
          count > 0
            ? "bg-orange-600/20 border-orange-500/50 text-orange-300 hover:bg-orange-600/30"
            : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
        }`}
      >
        <Library size={13} />
        Biblioteca
        {count > 0 && (
          <span className="text-[10px] bg-orange-500/30 text-orange-300 px-1.5 py-0.5 rounded-full font-semibold">
            {count}
          </span>
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4,video/mov,video/webm,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* ─── Library overlay ─────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <Library size={18} className="text-orange-400" />
              <div>
                <h2 className="text-sm font-semibold text-white">Biblioteca de Anuncios</h2>
                <p className="text-xs text-gray-500">
                  {count} {count === 1 ? "anuncio" : "anuncios"} guardados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg transition"
              >
                <Upload size={13} />
                Subir anuncio
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Filter bar */}
          {ads.length > 1 && (
            <div className="px-6 py-3 border-b border-gray-800 flex gap-2 flex-wrap flex-shrink-0">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    filter === p
                      ? "bg-orange-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 size={24} className="text-gray-600 animate-spin" />
              </div>
            ) : filteredAds.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-center gap-3">
                <Library size={44} className="text-gray-800" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Sin anuncios guardados</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Sube fotos y videos de anuncios que inspiren tu trabajo
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  <Upload size={13} />
                  Subir primer anuncio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredAds.map((ad) => (
                  <AdCard
                    key={ad.id}
                    ad={ad}
                    onClick={() => setSelectedAd(ad)}
                    onDelete={() => handleDelete(ad.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Ad detail modal ─────────────────────────────────────────── */}
      {selectedAd && (
        <div
          className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setSelectedAd(null)}
        >
          <div
            className="bg-gray-900 rounded-2xl overflow-hidden w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                    PLATFORM_COLORS[selectedAd.platform] ?? PLATFORM_COLORS.Otro
                  }`}
                >
                  {selectedAd.platform}
                </span>
                <span className="text-xs text-gray-500">
                  {selectedAd.file_type === "image" ? (
                    <span className="flex items-center gap-1"><ImageIcon size={11} /> Imagen</span>
                  ) : (
                    <span className="flex items-center gap-1"><Film size={11} /> Video</span>
                  )}
                </span>
                <span className="text-xs text-gray-600">{formatBytes(selectedAd.file_size)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDelete(selectedAd.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setSelectedAd(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Media */}
            <div className="flex-1 overflow-auto bg-black/40 flex items-center justify-center min-h-0">
              {selectedAd.file_type === "image" ? (
                <img
                  src={selectedAd.url}
                  alt={selectedAd.file_name}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              ) : (
                <video
                  src={selectedAd.url}
                  controls
                  autoPlay={false}
                  className="max-w-full max-h-[60vh]"
                />
              )}
            </div>

            {/* Meta */}
            {(selectedAd.tags.length > 0 || selectedAd.notes) && (
              <div className="px-5 py-4 border-t border-gray-800 space-y-2.5 flex-shrink-0">
                {selectedAd.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag size={11} className="text-gray-600 flex-shrink-0" />
                    {selectedAd.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                {selectedAd.notes && (
                  <div className="flex items-start gap-2">
                    <StickyNote size={11} className="text-gray-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-400 leading-relaxed">{selectedAd.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Upload modal ────────────────────────────────────────────── */}
      {uploadModal && uploadFile && (
        <div className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl overflow-hidden w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <p className="text-sm font-semibold text-white">Guardar anuncio</p>
              <button
                onClick={resetUpload}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Preview */}
              <div className="w-full rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center min-h-[120px] max-h-52">
                {uploadPreview ? (
                  <img
                    src={uploadPreview}
                    alt="preview"
                    className="w-full max-h-52 object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8 text-gray-600">
                    <Film size={28} />
                    <p className="text-xs text-center px-4 truncate max-w-[200px]">{uploadFile.name}</p>
                    <p className="text-[10px] text-gray-700">{formatBytes(uploadFile.size)}</p>
                  </div>
                )}
              </div>

              {/* Platform */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                  Plataforma
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setUploadPlatform(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                        uploadPlatform === p
                          ? "bg-orange-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={uploadTagInput}
                    onChange={(e) => setUploadTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addTag(); }
                    }}
                    placeholder="urgencia, descuento, testimonial..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  />
                  <button
                    onClick={addTag}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-orange-500 text-gray-400 hover:text-white transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {uploadTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {uploadTags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-xs text-orange-300 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                        <button
                          onClick={() => setUploadTags((t) => t.filter((x) => x !== tag))}
                          className="text-orange-400 hover:text-red-400 transition leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                  Notas (opcional)
                </label>
                <textarea
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="¿Qué te gustó? ¿Por qué lo guardaste? ¿Qué idea te dio?"
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition"
              >
                {uploading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Upload size={13} />
                )}
                {uploading ? "Subiendo..." : "Guardar en biblioteca"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AdCard({
  ad,
  onClick,
  onDelete,
}: {
  ad: Ad;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-orange-500/50 transition cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="aspect-[9/16] relative overflow-hidden bg-gray-800">
        {ad.file_type === "image" ? (
          <img
            src={ad.url}
            alt={ad.file_name}
            loading="lazy"
            className="w-full h-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <>
            <video
              src={ad.url}
              preload="metadata"
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center border border-white/20">
                <Play size={14} className="text-white ml-0.5" fill="white" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
            PLATFORM_COLORS[ad.platform] ?? PLATFORM_COLORS.Otro
          }`}
        >
          {ad.platform}
        </span>
        {ad.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {ad.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                #{tag}
              </span>
            ))}
            {ad.tags.length > 2 && (
              <span className="text-[9px] text-gray-600">+{ad.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>

      {/* Delete on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-black/60 hover:bg-red-500/80 text-white transition"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}
