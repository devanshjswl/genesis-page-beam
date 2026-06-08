import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Inbox, FolderKanban, LogOut, ExternalLink, Menu, X } from "lucide-react";
import { toast } from "sonner";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (active) navigate("/admin/auth", { replace: true });
        return;
      }
      setUserEmail(user.email ?? "");
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isAdmin = (roles ?? []).some((r) => r.role === "admin");
      if (!active) return;
      setAuthorized(isAdmin);
      setChecking(false);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/admin/auth", { replace: true });
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/admin/auth", { replace: true });
  };

  if (checking) {
    return <div className="min-h-screen bg-background grid place-items-center text-muted-foreground text-sm">Checking access…</div>;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center px-6">
        <div className="bento-card !p-8 max-w-md text-center">
          <h1 className="font-display text-2xl font-bold">Not an admin yet</h1>
          <p className="text-sm text-muted-foreground mt-3">
            Your account <span className="text-foreground">{userEmail}</span> isn't marked as an admin.
            Ask the project owner to promote it, then sign back in.
          </p>
          <div className="mt-6 flex gap-2 justify-center">
            <Button variant="outline" onClick={signOut}>Sign out</Button>
            <Link to="/"><Button variant="secondary">Home</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
      isActive
        ? "bg-gold text-primary-foreground shadow-gold"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    }`;

  const navItems = (
    <>
      <NavLink to="/admin" end className={linkClass} onClick={() => setMenuOpen(false)}>
        <Inbox className="size-4" /> Messages
      </NavLink>
      <NavLink to="/admin/projects" className={linkClass} onClick={() => setMenuOpen(false)}>
        <FolderKanban className="size-4" /> Projects
      </NavLink>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar (mobile) */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur">
        <Link to="/admin" className="font-display font-bold">Admin</Link>
        <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menu" className="p-2 rounded-md hover:bg-secondary">
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${menuOpen ? "block" : "hidden"} md:block fixed md:sticky top-0 md:top-0 inset-x-0 md:inset-x-auto md:h-screen md:w-64 z-30 bg-background md:border-r border-border p-4 md:py-6`}
        >
          <div className="hidden md:flex items-center gap-2 mb-8 px-2">
            <span className="grid place-items-center size-9 rounded-full bg-gold text-primary-foreground font-display font-bold text-sm shadow-gold">DJ</span>
            <div>
              <div className="font-display font-bold leading-none">Admin</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">Dashboard</div>
            </div>
          </div>

          <nav className="space-y-1">{navItems}</nav>

          <div className="md:absolute md:bottom-4 md:left-4 md:right-4 mt-6 md:mt-0 space-y-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            >
              <ExternalLink className="size-4" /> View site
            </a>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            >
              <LogOut className="size-4" /> Sign out
            </button>
            <div className="px-4 pt-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 truncate">
              {userEmail}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 px-4 md:px-10 py-6 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
