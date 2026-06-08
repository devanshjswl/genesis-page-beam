import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Star, ExternalLink, X, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { resolveProjectImage } from "@/lib/projectImage";


type Project = {
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  image_url: string | null;
  link_url: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
};

type FormState = {
  id?: string;
  title: string;
  blurb: string;
  tagsText: string;
  link_url: string;
  featured: boolean;
  sort_order: number;
  image_url: string | null;
};

const emptyForm: FormState = {
  title: "", blurb: "", tagsText: "", link_url: "", featured: false, sort_order: 0, image_url: null,
};

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [editingPreview, setEditingPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else {
      const list = (data ?? []) as Project[];
      setProjects(list);
      const entries = await Promise.all(
        list.map(async (p) => [p.id, (await resolveProjectImage(p.image_url)) ?? ""] as const),
      );
      setImageUrls(Object.fromEntries(entries.filter(([, u]) => u)));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let active = true;
    if (!editing?.image_url) { setEditingPreview(null); return; }
    resolveProjectImage(editing.image_url).then((u) => { if (active) setEditingPreview(u); });
    return () => { active = false; };
  }, [editing?.image_url]);

  const startNew = () => setEditing({ ...emptyForm });
  const startEdit = (p: Project) =>
    setEditing({
      id: p.id, title: p.title, blurb: p.blurb,
      tagsText: p.tags.join(", "),
      link_url: p.link_url ?? "", featured: p.featured, sort_order: p.sort_order, image_url: p.image_url,
    });

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("project-images").upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      setEditing((cur) => (cur ? { ...cur, image_url: path } : cur));
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };


  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.blurb.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    const payload = {
      title: editing.title.trim(),
      blurb: editing.blurb.trim(),
      tags: editing.tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      link_url: editing.link_url.trim() || null,
      image_url: editing.image_url,
      featured: editing.featured,
      sort_order: Number(editing.sort_order) || 0,
    };
    const { error } = editing.id
      ? await supabase.from("projects").update(payload).eq("id", editing.id)
      : await supabase.from("projects").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Project updated" : "Project added");
    setEditing(null);
    load();
  };

  const remove = async (p: Project) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setProjects((prev) => prev.filter((x) => x.id !== p.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">{projects.length} live on your site</p>
        </div>
        <Button onClick={startNew} className="bg-gold text-primary-foreground hover:opacity-90 shadow-gold">
          <Plus className="size-4 mr-1.5" /> New project
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground p-4">Loading…</div>
      ) : projects.length === 0 ? (
        <div className="bento-card !p-8 text-center text-muted-foreground">
          No projects yet. Click <strong className="text-foreground">New project</strong> to add your first one.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => (
            <article key={p.id} className="bento-card !p-0 overflow-hidden flex flex-col">
              {imageUrls[p.id] ? (
                <img src={imageUrls[p.id]} alt={p.title} className="w-full h-44 object-cover" />
              ) : (
                <div className="w-full h-44 bg-secondary grid place-items-center text-muted-foreground text-xs">No image</div>
              )}

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-semibold text-lg leading-tight">{p.title}</h3>
                  {p.featured && <Star className="size-4 text-primary fill-primary shrink-0" />}
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1">{p.blurb}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.tags.slice(0, 4).map((t) => (
                    <span key={t} className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md bg-secondary text-muted-foreground border border-border">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                    <Pencil className="size-3.5 mr-1.5" /> Edit
                  </Button>
                  {p.link_url && (
                    <a href={p.link_url} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline"><ExternalLink className="size-3.5 mr-1.5" /> Open</Button>
                    </a>
                  )}
                  <Button size="sm" variant="outline" className="ml-auto text-destructive hover:text-destructive" onClick={() => remove(p)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto" onClick={() => !saving && setEditing(null)}>
          <div className="bento-card !p-6 w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-bold">{editing.id ? "Edit project" : "New project"}</h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded-md hover:bg-secondary"><X className="size-4" /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Title</label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="bg-secondary border-border" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Description</label>
                <Textarea rows={4} value={editing.blurb} onChange={(e) => setEditing({ ...editing, blurb: e.target.value })} className="bg-secondary border-border resize-none" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Tags (comma separated)</label>
                  <Input value={editing.tagsText} onChange={(e) => setEditing({ ...editing, tagsText: e.target.value })} placeholder="React, TypeScript, Firebase" className="bg-secondary border-border" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Link URL</label>
                  <Input type="url" value={editing.link_url} onChange={(e) => setEditing({ ...editing, link_url: e.target.value })} placeholder="https://…" className="bg-secondary border-border" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Image</label>
                <div className="flex items-center gap-4">
                  {editing.image_url ? (
                    <img src={editing.image_url} alt="" className="size-20 rounded-lg object-cover border border-border" />
                  ) : (
                    <div className="size-20 rounded-lg bg-secondary border border-border grid place-items-center text-muted-foreground">
                      <ImagePlus className="size-5" />
                    </div>
                  )}
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm hover:border-primary/50 transition">
                    {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                    {uploading ? "Uploading…" : editing.image_url ? "Replace image" : "Upload image"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
                  </label>
                  {editing.image_url && (
                    <Button variant="ghost" size="sm" onClick={() => setEditing({ ...editing, image_url: null })}>Remove</Button>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Sort order</label>
                  <Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} className="bg-secondary border-border" />
                </div>
                <label className="flex items-end gap-2 cursor-pointer pb-2">
                  <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="size-4 accent-primary" />
                  <span className="text-sm">Featured (larger card)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-5 border-t border-border">
              <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
              <Button onClick={save} disabled={saving} className="bg-gold text-primary-foreground hover:opacity-90 shadow-gold">
                {saving ? "Saving…" : editing.id ? "Save changes" : "Create project"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
