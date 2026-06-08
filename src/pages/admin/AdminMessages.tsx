import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, Trash2, Circle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
};

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setMessages((data ?? []) as Message[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleRead = async (m: Message) => {
    const { error } = await supabase.from("messages").update({ read: !m.read }).eq("id", m.id);
    if (error) return toast.error(error.message);
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: !x.read } : x)));
    if (selected?.id === m.id) setSelected({ ...m, read: !m.read });
  };

  const remove = async (m: Message) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("messages").delete().eq("id", m.id);
    if (error) return toast.error(error.message);
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
    if (selected?.id === m.id) setSelected(null);
    toast.success("Deleted");
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {messages.length} total · <span className="text-primary">{unread} unread</span>
          </p>
        </div>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {loading && <div className="text-sm text-muted-foreground p-4">Loading…</div>}
          {!loading && messages.length === 0 && (
            <div className="bento-card !p-6 text-center text-muted-foreground text-sm">
              <Mail className="size-6 mx-auto mb-2 opacity-50" />
              No messages yet. The "Let's Talk" form will deliver them here.
            </div>
          )}
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => { setSelected(m); if (!m.read) toggleRead(m); }}
              className={`w-full text-left bento-card !p-4 transition ${
                selected?.id === m.id ? "border-primary/60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {!m.read && <span className="size-2 rounded-full bg-primary shrink-0" />}
                    <div className="font-display font-semibold truncate">{m.name}</div>
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">{m.email}</div>
                  <div className="text-sm text-muted-foreground/80 line-clamp-2 mt-2">{m.message}</div>
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground shrink-0">
                  {new Date(m.created_at).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <div className="bento-card !p-6 space-y-5 sticky top-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-display text-xl font-bold">{selected.name}</div>
                  <a href={`mailto:${selected.email}`} className="text-sm text-primary hover:underline break-all">{selected.email}</a>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                    {new Date(selected.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleRead(selected)}>
                    {selected.read ? <Circle className="size-4 mr-1.5" /> : <CheckCircle2 className="size-4 mr-1.5" />}
                    Mark {selected.read ? "unread" : "read"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => remove(selected)}>
                    <Trash2 className="size-4 mr-1.5" /> Delete
                  </Button>
                </div>
              </div>
              <div className="rounded-lg bg-secondary border border-border p-5 whitespace-pre-wrap text-sm leading-relaxed">
                {selected.message}
              </div>
              <a
                href={`mailto:${selected.email}?subject=Re: your message`}
                className="inline-flex items-center gap-2 rounded-full bg-gold text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition shadow-gold"
              >
                <Mail className="size-4" /> Reply
              </a>
            </div>
          ) : (
            <div className="bento-card !p-10 text-center text-muted-foreground text-sm hidden lg:block">
              Select a message to read it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
