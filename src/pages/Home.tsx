import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  Github,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Sparkles,
  Code2,
  Calculator,
  BookOpen,
  Video,
  Camera,
  Zap,
  Send,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { photographerInfo as me } from "@/data/photographer";
import { supabase } from "@/integrations/supabase/client";
import { resolveProjectImage } from "@/lib/projectImage";


/* ------------------------------------------------------------------ */
/* Animated tech background — pure CSS canvas of subtle moving lines  */
/* ------------------------------------------------------------------ */
function TechBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let h = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);
    const dpr = window.devicePixelRatio;

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
    };
    window.addEventListener("resize", onResize);

    // Floating particles connected by faint gold lines
    const N = 48;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25 * dpr,
      vy: (Math.random() - 0.5) * 0.25 * dpr,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }

      // Connections
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = pts[i];
          const b = pts[j];
          const d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
          const max = (140 * dpr) ** 2;
          if (d2 < max) {
            const alpha = 1 - d2 / max;
            ctx.strokeStyle = `rgba(201, 168, 76, ${alpha * 0.22})`;
            ctx.lineWidth = 0.5 * dpr;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Dots
      for (const p of pts) {
        ctx.fillStyle = "rgba(240, 215, 140, 0.55)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-noir" />
      <div className="absolute inset-0 bg-grid opacity-40" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Gold glow */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full blur-[140px] opacity-25"
        style={{ background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)" }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Top navigation                                                     */
/* ------------------------------------------------------------------ */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Work", href: "#work" },
    { label: "About", href: "#about" },
    { label: "Create", href: "#create" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div
          className={`flex items-center justify-between rounded-full px-4 md:px-6 py-2.5 transition-all duration-500 ${
            scrolled ? "glass shadow-card" : ""
          }`}
        >
          <a href="#top" className="flex items-center gap-2 group">
            <span className="grid place-items-center size-8 rounded-full bg-gold text-primary-foreground font-display font-bold text-sm shadow-gold">
              {me.initials}
            </span>
            <span className="hidden sm:block font-display text-sm tracking-tight">
              {me.shortName}
              <span className="text-primary">.</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-gold text-primary-foreground text-xs font-medium px-4 py-2 hover:opacity-90 transition shine"
          >
            Let's talk
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>
    </motion.header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={ref} id="top" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <TechBackdrop />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground mb-8"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
            <span className="relative rounded-full size-1.5 bg-primary" />
          </span>
          {me.availability}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="font-display font-bold leading-[0.95] tracking-tight text-[clamp(3rem,11vw,9rem)]"
        >
          <span className="block">Devansh</span>
          <span className="block text-gold">Jaiswal.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-8 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed"
        >
          {me.heroIntroduction}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#work"
            className="inline-flex items-center gap-2 rounded-full bg-gold text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition shadow-gold shine"
          >
            View my work
            <ArrowUpRight className="size-4" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 backdrop-blur px-6 py-3 text-sm font-medium hover:border-primary/50 transition"
          >
            Get in touch
          </a>
        </motion.div>

        {/* Marquee tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-muted-foreground/70 uppercase tracking-widest"
        >
          {["React", "TypeScript", "Firebase", "Node", "Tailwind", "Content", "YouTube"].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <span className="size-1 rounded-full bg-primary/60" />
              {t}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/60"
      >
        Scroll
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Bento section utilities                                            */
/* ------------------------------------------------------------------ */
function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-primary">
      <span className="h-px w-8 bg-primary" />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Work / Projects (DB-driven with hardcoded fallback)               */
/* ------------------------------------------------------------------ */
type DBProject = {
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  image_url: string | null;
  link_url: string | null;
  featured: boolean;
};

const fallbackProjects: Array<{
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  icon: typeof Calculator;
  featured: boolean;
  link_url: string | null;
}> = [
  {
    id: "f1",
    title: "JEE Main Score Calculator",
    blurb:
      "An ultra-smooth, instant score & percentile calculator built for JEE aspirants. Optimised for speed, animations and zero-friction input.",
    tags: ["React", "TypeScript", "Tailwind"],
    icon: Calculator,
    featured: true,
    link_url: null,
  },
  {
    id: "f2",
    title: "Real-Time Study Tracker",
    blurb:
      "A synchronized web app where study sessions update live across devices. Built with vanilla JS + Firebase Realtime DB.",
    tags: ["HTML", "CSS", "JS", "Firebase"],
    icon: BookOpen,
    featured: false,
    link_url: null,
  },
  {
    id: "f3",
    title: "@the.poligion",
    blurb:
      "Editorial Instagram page exploring culture, ideas & politics — content design, captions and growth, end to end.",
    tags: ["Instagram", "Editorial"],
    icon: Instagram,
    featured: false,
    link_url: me.socialLinks.instagram,
  },
];

function Work() {
  const [projects, setProjects] = useState<DBProject[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("id,title,blurb,tags,image_url,link_url,featured")
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      const list = (data ?? []) as DBProject[];
      setProjects(list);
      setLoaded(true);
      const entries = await Promise.all(
        list.map(async (p) => [p.id, (await resolveProjectImage(p.image_url)) ?? ""] as const),
      );
      setImageUrls(Object.fromEntries(entries.filter(([, u]) => u)));
    })();
  }, []);

  const usingDb = projects.length > 0;

  return (
    <section id="work" className="relative py-28 md:py-40 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="space-y-4">
              <SectionLabel>Selected work</SectionLabel>
              <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight max-w-2xl">
                Things I've built <span className="text-gold">&amp; shipped.</span>
              </h2>
            </div>
            <p className="text-muted-foreground max-w-sm md:text-right">
              A mix of full-stack web tools and content products. Every detail intentional.
            </p>
          </div>
        </Reveal>

        {!loaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bento-card h-64 animate-pulse" />
            ))}
          </div>
        ) : usingDb ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {projects.map((p, i) => {
              const card = (
                <article className={`bento-card group h-full !p-0 overflow-hidden flex flex-col ${p.featured ? "lg:col-span-2" : ""}`}>
                  {imageUrls[p.id] ? (
                    <img src={imageUrls[p.id]} alt={p.title} className={`w-full object-cover ${p.featured ? "h-56 md:h-72" : "h-48"}`} />
                  ) : (
                    <div className={`w-full bg-secondary grid place-items-center ${p.featured ? "h-56 md:h-72" : "h-48"}`}>
                      <Code2 className="size-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className={`font-display font-semibold tracking-tight ${p.featured ? "text-2xl" : "text-lg"}`}>{p.title}</h3>
                      {p.link_url && <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">{p.blurb}</p>
                    {p.tags.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {p.tags.map((t) => (
                          <span key={t} className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md bg-secondary text-muted-foreground border border-border">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
              return (
                <Reveal key={p.id} delay={i * 0.06}>
                  {p.link_url ? (
                    <a href={p.link_url} target="_blank" rel="noopener noreferrer" className="block h-full">{card}</a>
                  ) : (
                    card
                  )}
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[minmax(180px,auto)] gap-4 md:gap-5">
            {fallbackProjects.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.id} delay={i * 0.06}>
                  <article className={`bento-card group h-full ${p.featured ? "md:col-span-2 md:row-span-2 min-h-[360px]" : "md:col-span-2"}`}>
                    <div className="relative flex flex-col h-full">
                      <div className="flex items-start justify-between">
                        <div className="size-11 rounded-xl bg-secondary border border-border grid place-items-center text-primary group-hover:bg-gold group-hover:text-primary-foreground group-hover:border-transparent transition-all duration-500">
                          <Icon className="size-5" strokeWidth={1.6} />
                        </div>
                        <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-primary transition-all" />
                      </div>
                      <h3 className={`mt-6 font-display font-semibold tracking-tight ${p.featured ? "text-2xl md:text-3xl" : "text-xl"}`}>{p.title}</h3>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">{p.blurb}</p>
                      <div className="mt-6 flex flex-wrap gap-1.5">
                        {p.tags.map((t) => (
                          <span key={t} className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md bg-secondary text-muted-foreground border border-border">{t}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}


/* ------------------------------------------------------------------ */
/* About                                                              */
/* ------------------------------------------------------------------ */
function About() {
  return (
    <section id="about" className="relative py-28 md:py-40 px-6 overflow-hidden">
      <div
        className="absolute top-1/2 -left-40 size-[500px] rounded-full blur-[120px] opacity-20"
        style={{ background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)" }}
      />
      <div className="max-w-6xl mx-auto relative">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <Reveal className="md:col-span-5">
            <div className="space-y-6">
              <SectionLabel>About</SectionLabel>
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                Developer who <em className="text-gold not-italic">creates</em>. Creator who <em className="text-gold not-italic">codes</em>.
              </h2>
              <div className="grid grid-cols-2 gap-4 pt-4">
                {me.stats.map((s) => (
                  <div key={s.label} className="bento-card !p-4">
                    <div className="font-display text-2xl font-bold text-gold">{s.value}</div>
                    <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="md:col-span-7">
            <div className="space-y-6 text-base md:text-lg leading-relaxed text-muted-foreground">
              {me.biography.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}

              <div className="bento-card mt-8 !p-6 border-primary/20">
                <div className="flex items-start gap-4">
                  <Sparkles className="size-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-foreground italic font-display text-lg leading-relaxed">
                    “{me.approach}”
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Create — the creator side                                          */
/* ------------------------------------------------------------------ */
function Create() {
  const items = [
    { icon: Instagram, label: "@the.poligion", note: "Editorial Instagram page", href: me.socialLinks.instagram },
    { icon: Youtube, label: "YouTube", note: "Long & short form video", href: me.socialLinks.youtube },
    { icon: Video, label: "Production", note: "Scripting · shoot · edit", href: me.socialLinks.youtube },
    { icon: Camera, label: "Brand content", note: "Social ops for creators", href: me.socialLinks.instagram },
  ];

  return (
    <section id="create" className="relative py-20 md:py-28 px-6 border-y border-border/50">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Zap className="size-5 text-primary" />
              <span className="font-display text-lg">The creator stack</span>
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Beyond the code
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <Reveal key={it.label} delay={i * 0.06}>
                <a
                  href={it.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bento-card group block h-full"
                >
                  <Icon className="size-5 text-primary mb-4" strokeWidth={1.6} />
                  <div className="font-display font-semibold">{it.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{it.note}</div>
                  <ArrowUpRight className="absolute top-5 right-5 size-4 text-muted-foreground group-hover:text-primary transition" />
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Contact                                                            */
/* ------------------------------------------------------------------ */
function Contact() {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(me.email);
      setCopied(true);
      toast.success("Email copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — try selecting it manually");
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };
    if (!payload.name || !payload.email || !payload.message) {
      toast.error("Please fill in all fields");
      setSending(false);
      return;
    }
    const { error } = await supabase.from("messages").insert(payload);
    setSending(false);
    if (error) {
      toast.error("Couldn't send — please try again");
      return;
    }
    toast.success("Message sent — I'll get back to you soon.");
    form.reset();
  };


  return (
    <section id="contact" className="relative py-28 md:py-40 px-6 overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 size-[800px] rounded-full blur-[150px] opacity-15"
        style={{ background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)" }}
      />

      <div className="max-w-5xl mx-auto relative">
        <Reveal>
          <div className="text-center space-y-5 mb-14">
            <SectionLabel>Contact</SectionLabel>
            <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
              Let's build <span className="text-gold">something.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Got a project, a wild idea, or just want to say hi? My inbox is always open.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-5 gap-5">
          {/* Form */}
          <Reveal>
            <form onSubmit={onSubmit} className="bento-card md:col-span-3 space-y-4 !p-7">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Your name"
                    className="bg-secondary border-border focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@domain.com"
                    className="bg-secondary border-border focus-visible:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell me about your project…"
                  className="bg-secondary border-border resize-none focus-visible:ring-primary"
                />
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="w-full bg-gold text-primary-foreground hover:opacity-90 shadow-gold shine"
              >
                <Send className="size-4 mr-2" />
                {sending ? "Sending…" : "Send message"}
              </Button>
            </form>
          </Reveal>

          {/* Side info */}
          <Reveal delay={0.1}>
            <div className="md:col-span-2 space-y-4">
              <button
                onClick={copyEmail}
                className="bento-card w-full text-left group !p-6"
                aria-label="Copy email address"
              >
                <Mail className="size-5 text-primary mb-3" />
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Email
                </div>
                <div className="font-display text-lg mt-1 flex items-center gap-2 break-all">
                  {me.email}
                  {copied ? (
                    <Check className="size-4 text-primary shrink-0" />
                  ) : (
                    <Copy className="size-4 text-muted-foreground group-hover:text-primary transition shrink-0" />
                  )}
                </div>
              </button>

              <div className="bento-card !p-6">
                <Code2 className="size-5 text-primary mb-3" />
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Based in
                </div>
                <div className="font-display text-lg mt-1">{me.location}</div>
              </div>

              <div className="bento-card !p-6">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                  Find me
                </div>
                <div className="flex gap-2">
                  {[
                    { icon: Instagram, href: me.socialLinks.instagram, label: "Instagram" },
                    { icon: Youtube, href: me.socialLinks.youtube, label: "YouTube" },
                    { icon: Github, href: me.socialLinks.github, label: "GitHub" },
                    { icon: Linkedin, href: me.socialLinks.linkedin, label: "LinkedIn" },
                  ].map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="size-10 grid place-items-center rounded-lg bg-secondary border border-border hover:bg-gold hover:text-primary-foreground hover:border-transparent transition-all"
                    >
                      <Icon className="size-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                             */
/* ------------------------------------------------------------------ */
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
        <div>
          © {year} {me.name}
        </div>
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          Designed &amp; built with care
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
        <Create />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
