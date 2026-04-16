"use client";

import { useState, useRef } from "react";
import { Wrench, BookOpen, FileText, Image as ImageIcon, Plus, Trash2, Eye, EyeOff, Loader2, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  createKBArticle, toggleKBPublished, deleteKBArticle,
  createGlobalDoc, deleteDoc,
  createTutorialFolder, toggleTutorialPublished, deleteTutorialFolder,
  addTutorialImage, deleteTutorialImage,
} from "@/lib/metafix/admin-actions";
import type { KnowledgeArticle, MetafixDoc, TutorialFolder, TutorialImage, MetafixArea } from "@/types";

type Tab = "kb" | "docs" | "tutorials";

const AREAS: { value: MetafixArea | "general"; label: string }[] = [
  { value: "waba",             label: "WABA" },
  { value: "meta_ads",         label: "Meta Ads" },
  { value: "catalogs",         label: "Catálogos" },
  { value: "business_manager", label: "Business Manager" },
  { value: "pixel",            label: "Píxel" },
  { value: "general",          label: "General" },
];

// ─── Shared ────────────────────────────────────────────────────────────────────

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="px-4 py-2 text-sm font-semibold rounded-lg transition"
      style={{
        background: active ? "rgba(37,99,235,0.2)" : "transparent",
        color: active ? "#93c5fd" : "#6b7280",
        border: active ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
      }}>
      {children}
    </button>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl p-5 space-y-4" style={{ background: "#1c1b1b" }}>{children}</div>;
}

function Input({ label, value, onChange, placeholder, multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  const cls = "w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition";
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className={cls + " resize-none"} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}

function AreaSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Área</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition">
        <option value="">-- Seleccionar --</option>
        {AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
      </select>
    </div>
  );
}

// ─── KB Tab ────────────────────────────────────────────────────────────────────

function KBTab({ articles: initial }: { articles: KnowledgeArticle[] }) {
  const [articles, setArticles] = useState(initial);
  const [open, setOpen]         = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", area: "general" as MetafixArea | "general",
    error_codes: "", tags: "", problem: "", cause: "", solution: "", prevention: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
  });

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function handleCreate() {
    if (!form.title || !form.problem || !form.cause || !form.solution) return;
    setSaving(true);
    try {
      await createKBArticle({
        slug: form.slug || slugify(form.title),
        title: form.title, area: form.area,
        error_codes: form.error_codes.split(",").map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        problem: form.problem, cause: form.cause, solution: form.solution,
        prevention: form.prevention || undefined, difficulty: form.difficulty,
      });
      setForm({ title: "", slug: "", area: "general", error_codes: "", tags: "", problem: "", cause: "", solution: "", prevention: "", difficulty: "medium" });
      setOpen(false);
      window.location.reload();
    } finally { setSaving(false); }
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleKBPublished(id, !current);
    setArticles((prev) => prev.map((a) => a.id === id ? { ...a, is_published: !current } : a));
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este artículo?")) return;
    await deleteKBArticle(id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* Create form */}
      <SectionCard>
        <button onClick={() => setOpen((v) => !v)} className="flex items-center justify-between w-full">
          <span className="text-sm font-bold text-white flex items-center gap-2"><Plus size={14} className="text-blue-400" />Nuevo artículo KB</span>
          {open ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
        </button>
        {open && (
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Título" value={form.title} onChange={(v) => setForm({ ...form, title: v, slug: slugify(v) })} placeholder="Error 131031 — Número no válido" />
              <Input label="Slug (auto)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="error-131031-waba" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <AreaSelect value={form.area} onChange={(v) => setForm({ ...form, area: v as MetafixArea | "general" })} />
              <Input label="Códigos de error (comas)" value={form.error_codes} onChange={(v) => setForm({ ...form, error_codes: v })} placeholder="131031, 131026" />
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Dificultad</label>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as "easy" | "medium" | "hard" })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition">
                  <option value="easy">Fácil</option>
                  <option value="medium">Medio</option>
                  <option value="hard">Difícil</option>
                </select>
              </div>
            </div>
            <Input label="Problema" value={form.problem} onChange={(v) => setForm({ ...form, problem: v })} multiline placeholder="Descripción del problema..." />
            <Input label="Causa raíz" value={form.cause} onChange={(v) => setForm({ ...form, cause: v })} multiline placeholder="Por qué ocurre..." />
            <Input label="Solución paso a paso" value={form.solution} onChange={(v) => setForm({ ...form, solution: v })} multiline placeholder="1. Hacer esto... 2. Luego esto..." />
            <Input label="Prevención (opcional)" value={form.prevention} onChange={(v) => setForm({ ...form, prevention: v })} placeholder="Cómo evitarlo en el futuro..." />
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
              style={{ background: "#2563eb" }}>
              {saving ? <><Loader2 size={13} className="animate-spin" />Guardando...</> : "Guardar artículo"}
            </button>
          </div>
        )}
      </SectionCard>

      {/* Articles list */}
      <div className="space-y-2">
        {articles.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#1c1b1b" }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{a.title}</p>
              <p className="text-[11px] text-gray-500">{a.area} · {a.difficulty}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.is_published ? "bg-green-500/10 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                {a.is_published ? "Publicado" : "Borrador"}
              </span>
              <button onClick={() => handleToggle(a.id, a.is_published)} title={a.is_published ? "Despublicar" : "Publicar"}
                className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition">
                {a.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button onClick={() => handleDelete(a.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Docs Tab ──────────────────────────────────────────────────────────────────

function DocsTab({ docs: initial }: { docs: MetafixDoc[] }) {
  const [docs,   setDocs]   = useState(initial);
  const [open,   setOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", source: "", area: "general" as MetafixArea | "general" });

  async function handleCreate() {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      await createGlobalDoc({ title: form.title, content: form.content, source: form.source || undefined, area: form.area });
      setForm({ title: "", content: "", source: "", area: "general" });
      setOpen(false);
      window.location.reload();
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este documento?")) return;
    await deleteDoc(id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-4">
      <SectionCard>
        <button onClick={() => setOpen((v) => !v)} className="flex items-center justify-between w-full">
          <span className="text-sm font-bold text-white flex items-center gap-2"><Plus size={14} className="text-blue-400" />Nuevo documento</span>
          {open ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
        </button>
        {open && (
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Título" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Políticas de Meta Ads" />
              <Input label="Fuente" value={form.source} onChange={(v) => setForm({ ...form, source: v })} placeholder="Meta Business Help Center" />
            </div>
            <AreaSelect value={form.area} onChange={(v) => setForm({ ...form, area: v as MetafixArea | "general" })} />
            <Input label="Contenido" value={form.content} onChange={(v) => setForm({ ...form, content: v })} multiline placeholder="Pegá la documentación de Meta, notas, casos resueltos con contexto..." />
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
              style={{ background: "#2563eb" }}>
              {saving ? <><Loader2 size={13} className="animate-spin" />Guardando...</> : "Guardar documento"}
            </button>
          </div>
        )}
      </SectionCard>

      <div className="space-y-2">
        {docs.map((d) => (
          <div key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#1c1b1b" }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{d.title}</p>
              <p className="text-[11px] text-gray-500">{d.area ?? "general"}{d.source ? ` · ${d.source}` : ""} · {d.content.length} chars</p>
            </div>
            <button onClick={() => handleDelete(d.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition flex-shrink-0">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {docs.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Sin documentos todavía</p>}
      </div>
    </div>
  );
}

// ─── Tutorials Tab ─────────────────────────────────────────────────────────────

function TutorialsTab({ folders: initial }: { folders: (TutorialFolder & { tutorial_images: TutorialImage[] })[] }) {
  const [folders,       setFolders]       = useState(initial);
  const [openCreate,    setOpenCreate]    = useState(false);
  const [expandedId,    setExpandedId]    = useState<string | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [uploadingId,   setUploadingId]   = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", description: "", area: "general" as MetafixArea | "general" });
  const fileRef = useRef<HTMLInputElement>(null);

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function handleCreateFolder() {
    if (!form.title) return;
    setSaving(true);
    try {
      await createTutorialFolder({
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description || undefined,
        area: form.area,
      });
      setForm({ title: "", slug: "", description: "", area: "general" });
      setOpenCreate(false);
      window.location.reload();
    } finally { setSaving(false); }
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleTutorialPublished(id, !current);
    setFolders((prev) => prev.map((f) => f.id === id ? { ...f, is_published: !current } : f));
  }

  async function handleDeleteFolder(id: string) {
    if (!confirm("¿Eliminar esta carpeta y todas sus imágenes?")) return;
    await deleteTutorialFolder(id);
    setFolders((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleUploadImage(folderId: string, file: File, stepNumber: number) {
    setUploadingId(folderId);
    try {
      const supabase = createClient();
      const ext  = file.name.split(".").pop();
      const path = `${folderId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("tutorial-images").upload(path, file, { upsert: true });
      if (error) { alert("Error subiendo imagen"); return; }
      const { data } = supabase.storage.from("tutorial-images").getPublicUrl(path);
      await addTutorialImage({ folder_id: folderId, file_path: path, public_url: data.publicUrl, step_number: stepNumber });
      window.location.reload();
    } finally { setUploadingId(null); }
  }

  async function handleDeleteImage(imageId: string) {
    await deleteTutorialImage(imageId);
    setFolders((prev) => prev.map((f) => ({
      ...f,
      tutorial_images: f.tutorial_images.filter((img) => img.id !== imageId),
    })));
  }

  return (
    <div className="space-y-4">
      {/* Create folder */}
      <SectionCard>
        <button onClick={() => setOpenCreate((v) => !v)} className="flex items-center justify-between w-full">
          <span className="text-sm font-bold text-white flex items-center gap-2"><Plus size={14} className="text-blue-400" />Nueva carpeta de tutorial</span>
          {openCreate ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
        </button>
        {openCreate && (
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nombre" value={form.title} onChange={(v) => setForm({ ...form, title: v, slug: slugify(v) })} placeholder="Cambiar número WABA" />
              <Input label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="cambiar-numero-waba" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AreaSelect value={form.area} onChange={(v) => setForm({ ...form, area: v as MetafixArea | "general" })} />
              <Input label="Descripción (opcional)" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Paso a paso para..." />
            </div>
            <button onClick={handleCreateFolder} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
              style={{ background: "#2563eb" }}>
              {saving ? <><Loader2 size={13} className="animate-spin" />Creando...</> : "Crear carpeta"}
            </button>
          </div>
        )}
      </SectionCard>

      {/* Folders list */}
      <div className="space-y-3">
        {folders.map((folder) => {
          const imgs    = [...folder.tutorial_images].sort((a, b) => a.step_number - b.step_number);
          const isOpen  = expandedId === folder.id;
          const nextStep = imgs.length + 1;

          return (
            <div key={folder.id} className="rounded-2xl overflow-hidden border" style={{ background: "#1c1b1b", borderColor: "rgba(255,255,255,0.06)" }}>
              {/* Folder header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => setExpandedId(isOpen ? null : folder.id)} className="flex-1 min-w-0 flex items-center gap-3 text-left">
                  <ImageIcon size={14} className="text-blue-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{folder.title}</p>
                    <p className="text-[11px] text-gray-500">slug: {folder.slug} · {imgs.length} imágenes</p>
                  </div>
                  {isOpen ? <ChevronUp size={13} className="text-gray-500 flex-shrink-0 ml-auto" /> : <ChevronDown size={13} className="text-gray-500 flex-shrink-0 ml-auto" />}
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${folder.is_published ? "bg-green-500/10 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                    {folder.is_published ? "Publicado" : "Borrador"}
                  </span>
                  <button onClick={() => handleToggle(folder.id, folder.is_published)}
                    className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition">
                    {folder.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => handleDeleteFolder(folder.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Expanded: images + upload */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
                  {/* Existing images */}
                  {imgs.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {imgs.map((img) => (
                        <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-700" style={{ aspectRatio: "16/9" }}>
                          <img src={img.public_url} alt={img.caption ?? ""} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                            <span className="text-white text-[11px] font-bold">Paso {img.step_number}</span>
                            {img.caption && <span className="text-gray-300 text-[10px] text-center line-clamp-2">{img.caption}</span>}
                            <button onClick={() => handleDeleteImage(img.id)}
                              className="mt-1 p-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition">
                              <Trash2 size={11} />
                            </button>
                          </div>
                          <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {img.step_number}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload new image */}
                  <div className="flex items-center gap-3">
                    <input type="file" accept="image/*" className="hidden" ref={fileRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImage(folder.id, file, nextStep);
                        e.target.value = "";
                      }}
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploadingId === folder.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-dashed border-blue-500/30 text-blue-400 hover:border-blue-500 hover:bg-blue-500/5 transition disabled:opacity-50"
                    >
                      {uploadingId === folder.id
                        ? <><Loader2 size={13} className="animate-spin" />Subiendo...</>
                        : <><Upload size={13} />Subir paso {nextStep}</>
                      }
                    </button>
                    <span className="text-[11px] text-gray-500">Se agrega como paso {nextStep}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {folders.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Sin tutoriales todavía</p>}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  initialArticles: KnowledgeArticle[];
  initialDocs: MetafixDoc[];
  initialFolders: (TutorialFolder & { tutorial_images: TutorialImage[] })[];
}

export default function AdminPanel({ initialArticles, initialDocs, initialFolders }: Props) {
  const [tab, setTab] = useState<Tab>("kb");

  return (
    <div className="p-6 xl:p-8 min-h-screen" style={{ background: "#131313" }}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
            <Wrench size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MetaFix Admin</h1>
            <p className="text-xs text-gray-500">Base de conocimiento global — visible para todos los usuarios</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <TabBtn active={tab === "kb"} onClick={() => setTab("kb")}>
            <span className="flex items-center gap-2"><BookOpen size={13} />KB Articles ({initialArticles.length})</span>
          </TabBtn>
          <TabBtn active={tab === "docs"} onClick={() => setTab("docs")}>
            <span className="flex items-center gap-2"><FileText size={13} />Documentos ({initialDocs.length})</span>
          </TabBtn>
          <TabBtn active={tab === "tutorials"} onClick={() => setTab("tutorials")}>
            <span className="flex items-center gap-2"><ImageIcon size={13} />Tutoriales ({initialFolders.length})</span>
          </TabBtn>
        </div>

        {/* Tab content */}
        {tab === "kb"        && <KBTab articles={initialArticles} />}
        {tab === "docs"      && <DocsTab docs={initialDocs} />}
        {tab === "tutorials" && <TutorialsTab folders={initialFolders} />}
      </div>
    </div>
  );
}
