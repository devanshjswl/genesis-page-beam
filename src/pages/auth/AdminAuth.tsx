import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, ArrowLeft } from "lucide-react";

export default function AdminAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin", { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/admin", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-3.5" /> Back to site
        </Link>
        <div className="bento-card !p-8">
          <div className="size-11 rounded-xl bg-secondary border border-border grid place-items-center text-primary mb-5">
            <Lock className="size-5" strokeWidth={1.6} />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Admin {mode === "signup" ? "sign up" : "sign in"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage messages and projects from your dashboard.
          </p>

          <form onSubmit={onSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Email</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Password</label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border" />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-gold text-primary-foreground hover:opacity-90 shadow-gold">
              {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 text-xs text-muted-foreground hover:text-primary transition w-full text-center"
          >
            {mode === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
