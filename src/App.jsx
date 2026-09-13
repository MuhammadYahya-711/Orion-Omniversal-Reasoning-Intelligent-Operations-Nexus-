import { useCallback, useEffect, useRef, useState } from "react";
import { HashRouter, Link, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { interfaceLanguages, useLanguage } from "./i18n";
import {
  ArrowRight,
  BookOpen,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Code2,
  Copy,
  FileCode2,
  FileText,
  FolderKanban,
  Globe2,
  Image,
  Layers3,
  Loader2,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Mic,
  MoreHorizontal,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  Plus,
  Rocket,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  SquarePen,
  Star,
  Target,
  Upload,
  WandSparkles,
  Workflow,
  X,
  Zap,
} from "lucide-react";

const seedChats = [
  {
    id: "product-strategy",
    title: "Launch strategy for ORION",
    updatedAt: Date.now() - 1920000,
    messages: [
      { id: "one", role: "user", content: "Help me shape the first release of ORION." },
      {
        id: "two",
        role: "assistant",
        content:
          "## Product direction\n\nStart with a focused operating loop:\n\n1. Understand the user goal\n2. Plan tasks and research\n3. Create concrete outputs\n4. Track work to completion\n\n- Next action: turn the idea into a focused project roadmap.",
      },
    ],
  },
  { id: "study-plan", title: "Machine learning study plan", updatedAt: Date.now() - 10800000, messages: [] },
  { id: "market-map", title: "Competitive landscape map", updatedAt: Date.now() - 86400000, messages: [] },
];
const seedProjects = [
  {
    id: "orion-launch",
    name: "ORION Launch System",
    description: "Product positioning, onboarding, and launch readiness.",
    progress: 72,
    goals: 3,
    milestones: 3,
  },
  {
    id: "research-lab",
    name: "Applied Research Lab",
    description: "Turn emerging AI research into useful product opportunities.",
    progress: 44,
    goals: 2,
    milestones: 2,
  },
];
const seedFiles = [
  {
    id: "brief",
    name: "ORION_product_brief.pdf",
    kind: "PDF",
    size: "2.4 MB",
    summary: "Product positioning, audience needs, and experience principles.",
  },
  {
    id: "metrics",
    name: "launch_metrics.csv",
    kind: "CSV",
    size: "184 KB",
    summary: "Acquisition, activation, and retention planning metrics.",
  },
  {
    id: "prototype",
    name: "workspace_prototype.tsx",
    kind: "Code",
    size: "14 KB",
    summary: "Interactive workspace prototype with responsive components.",
  },
];
const navGroups = [
  {
    label: "Workspace",
    items: [
      ["/dashboard", "Overview", Layers3],
      ["/chat", "Chats", MessageSquareText],
      ["/projects", "Projects", FolderKanban],
      ["/files", "Files", FileText],
      ["/workspaces", "Workspaces", BriefcaseBusiness],
    ],
  },
  {
    label: "Create & explore",
    items: [
      ["/create", "Create", WandSparkles],
      ["/roadmap", "Roadmaps", Target],
      ["/workflows", "Workflows", Workflow],
      ["/research", "Research", Globe2],
      ["/code", "Code", Code2],
    ],
  },
  {
    label: "Discover ORION",
    items: [
      ["/capabilities", "Capabilities", Sparkles],
      ["/how-it-works", "How It Works", Network],
    ],
  },
];
const createTypes = [
  ["Document", FileText],
  ["Report", BriefcaseBusiness],
  ["Essay", BookOpen],
  ["Resume", Star],
  ["Study notes", BrainCircuit],
  ["Guide", Target],
  ["Research report", Globe2],
  ["Image", Image],
  ["Roadmap", Target],
  ["Workflow", Workflow],
  ["Code", Code2],
];
const cn = (...values) => values.filter(Boolean).join(" ");
const responseLanguages = [
  "English",
  "Afrikaans",
  "Albanian",
  "Amharic",
  "Arabic",
  "Armenian",
  "Assamese",
  "Azerbaijani",
  "Bangla (Bengali)",
  "Basque",
  "Belarusian",
  "Bosnian",
  "Bulgarian",
  "Burmese",
  "Catalan",
  "Cebuano",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "Estonian",
  "Filipino",
  "Finnish",
  "French",
  "Galician",
  "Georgian",
  "German",
  "Greek",
  "Gujarati",
  "Hausa",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Icelandic",
  "Igbo",
  "Indonesian",
  "Irish",
  "Italian",
  "Japanese",
  "Javanese",
  "Kannada",
  "Kazakh",
  "Khmer",
  "Korean",
  "Kurdish",
  "Kyrgyz",
  "Lao",
  "Latvian",
  "Lithuanian",
  "Macedonian",
  "Malay",
  "Malayalam",
  "Maltese",
  "Marathi",
  "Mongolian",
  "Nepali",
  "Norwegian",
  "Odia",
  "Pashto",
  "Persian (Farsi)",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Serbian",
  "Sinhala",
  "Slovak",
  "Slovenian",
  "Somali",
  "Spanish",
  "Swahili",
  "Swedish",
  "Tamil",
  "Telugu",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Uzbek",
  "Vietnamese",
  "Welsh",
  "Yoruba",
  "Zulu",
];
const buildOrionPrompt = (messages, mode, responseLanguage = "English") => {
  const recentHistory = messages
    .slice(-12)
    .map((message) => `${message.role === "user" ? "User" : "ORION"}: ${message.content}`)
    .join("\n\n")
    .slice(-12000);
  return `You are ORION, an AI operating workspace that turns conversations into useful action. Respond directly to the user's latest request using the conversation context below. Adapt to the request instead of reusing a canned template. Be accurate, practical, and clear. Use concise Markdown when it improves readability. Do not claim to have completed actions you cannot perform, do not invent sources or results, and do not reveal private chain-of-thought. For research mode, distinguish verified information from assumptions and cite source names or links when available. Respond in ${responseLanguage}, preserving the user's requested script, tone, and language if they explicitly ask for something different.\n\nCurrent mode: ${mode}\n\nConversation:\n${recentHistory}`;
};
const buildCreationPrompt = (kind, brief) => {
  const imageInstruction =
    kind === "Image"
      ? "The enabled workspace can create the visual direction and production prompt, but does not include an image-rendering API. Do not say an image was generated. Return a polished image-generation prompt with sections for Subject, Composition, Lighting, Palette, Style, Negative prompt, and Aspect ratio."
      : "Return the finished, editable content itself, not an outline, setup note, or promise to create it later. Use concise Markdown with meaningful headings, lists, and tables where helpful.";
  return `You are ORION's Creation Studio. Create a high-quality ${kind} from this brief:\n\n${brief}\n\n${imageInstruction}\n\nBe specific, useful, and ready to use. Do not invent facts, sources, or completed external actions.`;
};

function usePageMeta(title, description) {
  useEffect(() => {
    document.title = `${title} — ORION`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [title, description]);
}
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        await window.genmb.auth.ready();
        if (active) setUser(window.genmb.auth.getUser());
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    void init();
    const unsubscribe = window.genmb.auth.onAuthStateChange((next) => {
      if (active) setUser(next);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  return { user, loading };
}
function OrionMark({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_24px_rgba(85,169,255,0.46)]">
        <Sparkles size={17} strokeWidth={2.4} />
      </div>
      {!compact && (
        <div>
          <p className="text-sm font-extrabold tracking-[0.22em] text-foreground">ORION</p>
          <p className="-mt-0.5 text-[10px] tracking-[0.13em] text-muted-foreground">AI OPERATING NEXUS</p>
        </div>
      )}
    </div>
  );
}
function PrimaryButton({ className, children, ...props }) {
  return (
    <button
      {...props}
      className={cn(
        "focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(49,137,248,0.3)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}
function SecondaryButton({ className, children, ...props }) {
  return (
    <button
      {...props}
      className={cn(
        "focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-bold text-card-foreground transition hover:-translate-y-0.5 hover:bg-accent active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}
function Toasts({ toasts, dismiss }) {
  return (
    <div className="fixed right-4 top-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="glass flex gap-3 rounded-2xl p-4 shadow-2xl">
          <div
            className={cn(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
              toast.type === "error"
                ? "bg-destructive text-destructive-foreground"
                : toast.type === "success"
                  ? "bg-success text-success-foreground"
                  : "bg-primary text-primary-foreground",
            )}
          >
            {toast.type === "success" ? (
              <Check size={16} />
            ) : toast.type === "error" ? (
              <X size={16} />
            ) : (
              <Sparkles size={16} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">{toast.title}</p>
            {toast.description && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{toast.description}</p>}
          </div>
          <button
            aria-label="Dismiss notification"
            onClick={() => dismiss(toast.id)}
            className="focus-ring rounded-lg p-1 text-muted-foreground hover:bg-accent"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
function Modal({ title, onClose, children }) {
  const panel = useRef(null);
  const returnFocus = useRef(document.activeElement);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector("button, input, textarea, select")?.focus();
    const key = (event) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key === "Tab" && panel.current) {
        const targets = [
          ...panel.current.querySelectorAll(
            "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href]",
          ),
        ];
        const index = targets.indexOf(document.activeElement);
        if (event.shiftKey && index <= 0) {
          event.preventDefault();
          targets.at(-1)?.focus();
        } else if (!event.shiftKey && index === targets.length - 1) {
          event.preventDefault();
          targets[0]?.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", key);
      returnFocus.current?.focus?.();
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        aria-label="Close dialog"
        className="absolute inset-0 bg-background/75 backdrop-blur-sm"
      />
      <section
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="orion-dialog-title"
        className="glass relative z-10 w-full max-w-lg rounded-3xl p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="orion-dialog-title" className="text-xl font-extrabold text-foreground">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="focus-ring rounded-xl p-2 text-muted-foreground hover:bg-accent"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function AuthModal({ onClose, onSuccess, initialMode }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [verify, setVerify] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setPending(true);
    try {
      if (verify) {
        const user = await window.genmb.auth.verifySignUp(email, code);
        if (user) {
          onSuccess(`Welcome to ORION, ${user.name || "there"}.`);
          onClose();
        } else setError("That verification code was not accepted.");
      } else if (mode === "signup") {
        if (password.length < 8) {
          setError("Choose a password with at least 8 characters.");
          return;
        }
        await window.genmb.auth.signUp(email, password, name);
        setVerify(true);
      } else if (mode === "magic") {
        await window.genmb.auth.sendMagicLink(email);
        onSuccess("Check your email for a secure sign-in link.");
        onClose();
      } else if (mode === "reset") {
        await window.genmb.auth.requestPasswordReset(email);
        onSuccess("Check your email for reset instructions.");
        onClose();
      } else {
        const user = await window.genmb.auth.signInWithPassword(email, password);
        if (user) {
          onSuccess(`Welcome back, ${user.name || "there"}.`);
          onClose();
        } else setError("Sign-in was cancelled.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };
  const google = async () => {
    setPending(true);
    setError("");
    try {
      const user = await window.genmb.auth.signIn();
      if (user) {
        onSuccess(`Welcome to ORION, ${user.name || "there"}.`);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };
  const title = verify
    ? "Verify your email"
    : mode === "signup"
      ? "Create your nexus"
      : mode === "magic"
        ? "Email sign-in"
        : mode === "reset"
          ? "Reset password"
          : "Welcome back";
  return (
    <Modal title={title} onClose={onClose}>
      <p className="mb-5 text-sm text-muted-foreground">
        {verify
          ? `Enter the 6-digit code sent to ${email}.`
          : "Your private ORION workspace begins with a secure sign-in."}
      </p>
      <form noValidate onSubmit={submit} className="space-y-4">
        {!verify && mode === "signup" && (
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-bold">
              Name <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="focus-ring w-full rounded-xl border border-input bg-muted px-3 py-2.5 text-sm text-foreground"
            />
          </div>
        )}
        {!verify && (
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-bold">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(error)}
              className="focus-ring w-full rounded-xl border border-input bg-muted px-3 py-2.5 text-sm text-foreground"
              placeholder="you@example.com"
            />
          </div>
        )}
        {verify ? (
          <div>
            <label htmlFor="code" className="mb-1.5 block text-sm font-bold">
              Verification code
            </label>
            <input
              id="code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="focus-ring w-full rounded-xl border border-input bg-muted px-3 py-2.5 text-sm tracking-[0.35em] text-foreground"
              placeholder="123456"
            />
          </div>
        ) : (
          (mode === "signin" || mode === "signup") && (
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-bold">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="focus-ring w-full rounded-xl border border-input bg-muted px-3 py-2.5 text-sm text-foreground"
              />
            </div>
          )
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <PrimaryButton type="submit" disabled={pending} className="w-full">
          {pending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : verify ? (
            "Verify & enter ORION"
          ) : mode === "signup" ? (
            "Create account"
          ) : mode === "magic" ? (
            "Send sign-in link"
          ) : mode === "reset" ? (
            "Send reset instructions"
          ) : (
            "Sign in"
          )}
        </PrimaryButton>
      </form>
      {!verify && (
        <>
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-bold text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <SecondaryButton onClick={() => void google()} disabled={pending} className="w-full">
            <Sparkles size={16} />
            Continue with Google
          </SecondaryButton>
          <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-bold text-primary">
            {mode !== "signin" && (
              <button onClick={() => setMode("signin")} className="focus-ring rounded">
                Password sign-in
              </button>
            )}
            {mode !== "signup" && (
              <button onClick={() => setMode("signup")} className="focus-ring rounded">
                Create account
              </button>
            )}
            {mode !== "magic" && (
              <button onClick={() => setMode("magic")} className="focus-ring rounded">
                Email link
              </button>
            )}
            {mode !== "reset" && (
              <button onClick={() => setMode("reset")} className="focus-ring rounded">
                Forgot password?
              </button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
function Landing({ openAuth }) {
  usePageMeta(
    "Intelligent Operations Workspace",
    "ORION turns conversations into research, plans, projects, and action in one intelligent workspace.",
  );
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <OrionMark />
        <nav aria-label="Landing page" className="hidden gap-6 text-sm font-bold text-muted-foreground md:flex">
          <Link className="focus-ring rounded hover:text-foreground" to="/capabilities">
            Capabilities
          </Link>
          <Link className="focus-ring rounded hover:text-foreground" to="/how-it-works">
            How it works
          </Link>
          <Link className="focus-ring rounded hover:text-foreground" to="/research">
            Research
          </Link>
        </nav>
        <div className="flex gap-2">
          <button
            onClick={() => openAuth("signin")}
            className="focus-ring hidden rounded-xl px-3 text-sm font-bold text-muted-foreground hover:bg-accent hover:text-foreground sm:block"
          >
            Sign in
          </button>
          <PrimaryButton onClick={() => openAuth("signup")}>
            <Sparkles size={16} />
            Start with ORION
          </PrimaryButton>
        </div>
      </header>
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1fr_0.95fr] lg:pb-28 lg:pt-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-extrabold tracking-wide text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              OMNIVERSAL REASONING &amp; INTELLIGENT OPERATIONS NEXUS
            </div>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.04] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-7xl">
              One Intelligence.
              <br />
              <span className="text-primary">Infinite Possibilities.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              An AI operating workspace where conversation turns into action. Reason, research, create, plan, and move
              ambitious work forward from one calm command center.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryButton onClick={() => openAuth("signup")} className="px-5">
                <Rocket size={17} />
                Start with ORION
                <ArrowRight size={16} />
              </PrimaryButton>
              <Link
                to="/capabilities"
                className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-bold text-card-foreground hover:bg-accent"
              >
                <Layers3 size={17} />
                Explore capabilities
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-5 text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                Your workspace, your context
              </span>
              <span className="flex items-center gap-2">
                <Zap size={16} className="text-primary" />
                From insight to action
              </span>
            </div>
          </div>
          <div className="glass relative overflow-hidden rounded-[2rem] p-3 shadow-2xl">
            <div className="dot-grid absolute inset-0 opacity-20" />
            <div className="relative rounded-[1.4rem] border border-border bg-background/75">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-xs font-bold text-muted-foreground">ORION / Product strategy</span>
                <span className="rounded-md bg-primary/15 px-2 py-1 text-[10px] font-extrabold text-primary">
                  LIVE CONTEXT
                </span>
              </div>
              <div className="space-y-4 p-5">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                  Build a launch plan that turns early interest into committed teams.
                </div>
                <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-primary/15 bg-primary/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-extrabold text-primary">
                    <Sparkles size={14} />
                    ORION IS ORCHESTRATING
                  </div>
                  <p className="text-sm leading-6 text-foreground">
                    I mapped the launch into a focused operating sequence.
                  </p>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {["Narrative", "Audience", "Activation", "Measure"].map((item, index) => (
                      <div key={item} className="rounded-xl border border-border bg-card/70 p-2">
                        <span className="text-[10px] font-bold text-primary">0{index + 1}</span>
                        <p className="mt-1 text-[10px] font-bold text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card/80 p-3 text-xs text-muted-foreground">
                  <Sparkles size={15} className="mr-2 inline text-primary" />
                  Ask ORION to take the next step…
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="capabilities" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <p className="text-xs font-extrabold tracking-[0.18em] text-primary">A UNIFIED INTELLIGENCE LAYER</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
            Every kind of ambitious work, connected.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [BrainCircuit, "Reasoning", "Turn uncertainty into structured decisions."],
              [Globe2, "Research", "Find live evidence and compare perspectives."],
              [WandSparkles, "Creation", "Draft polished documents, visuals, and code."],
              [Network, "Operations", "Move work through projects, roadmaps, and workflows."],
            ].map(([Icon, title, copy]) => (
              <Link
                key={title}
                to="/capabilities"
                className="glass focus-ring group rounded-2xl p-5 transition hover:-translate-y-1 hover:border-primary/35"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon size={19} />
                </div>
                <h3 className="font-extrabold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-primary">
                  Explore <ChevronRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section id="flow" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="glass rounded-[2rem] p-8 sm:p-10">
            <p className="text-xs font-extrabold tracking-[0.18em] text-primary">THE ORION OPERATING LOOP</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
              Idea → conversation → completed result.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              ORION keeps useful context visible and turns it into plans, outputs, and focused next actions — without
              exposing private reasoning.
            </p>
            <div className="mt-8 grid gap-3 md:grid-cols-6">
              {["Understand", "Plan", "Execute", "Validate", "Refine", "Deliver"].map((step, index) => (
                <div key={step} className="rounded-2xl border border-border bg-background/40 p-4">
                  <span className="text-xs font-extrabold text-primary">0{index + 1}</span>
                  <p className="mt-4 text-sm font-extrabold text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
function CapabilitiesPage() {
  usePageMeta(
    "Capabilities",
    "Explore the real ORION capabilities available across chat, research, creation, files, projects, roadmaps, and workflows.",
  );
  const capabilities = [
    [
      MessageSquareText,
      "AI Chat",
      "Multi-turn conversations with saved history, Markdown responses, copying, and regeneration.",
    ],
    [
      BrainCircuit,
      "Reasoning & Planning",
      "Turn requests into structured decisions, practical plans, roadmaps, and next actions.",
    ],
    [Globe2, "Research", "Search the live web or recent news and work from the resulting source cards."],
    [
      FileText,
      "Files & Knowledge",
      "Upload supported files and analyze images you upload in the current browser session.",
    ],
    [
      WandSparkles,
      "Creation",
      "Generate editable documents, reports, study notes, guides, research outputs, code, and visual directions.",
    ],
    [
      FolderKanban,
      "Projects",
      "Create private project workspaces with goals, milestones, and connected working context.",
    ],
    [
      Target,
      "Roadmaps",
      "Organize a goal into phases, skills, tasks, resources, milestones, projects, and evaluation.",
    ],
    [Workflow, "Workflows", "Map reusable operational stages from research and planning through improvement."],
    [
      Settings2,
      "Personalization",
      "Set response language, style, skill level, response length, and creativity preferences.",
    ],
    [
      Star,
      "Saved Context",
      "Keep conversations, generated outputs, research activity, and workspace records in your private account.",
    ],
  ];
  return (
    <>
      <PageHeader
        eyebrow="ORION CAPABILITIES"
        title="One intelligence, connected to the work."
        description="ORION brings the capabilities already available in this workspace into one operational surface — from a conversation to a concrete next step."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {capabilities.map(([Icon, title, description]) => (
          <article key={title} className="glass rounded-3xl p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon size={19} />
            </div>
            <h2 className="mt-5 text-lg font-extrabold text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </article>
        ))}
      </section>
      <section className="glass mt-5 rounded-3xl p-5 sm:p-6">
        <p className="text-xs font-extrabold tracking-[0.16em] text-primary">AVAILABLE WITH CLEAR BOUNDARIES</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="font-extrabold text-foreground">Conversation context, not hidden autonomy</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              ORION saves your workspace records and uses the current conversation context to shape responses. It does
              not independently execute external tasks or retain an unrestricted cross-workspace memory.
            </p>
          </div>
          <div>
            <h2 className="font-extrabold text-foreground">Planned integrations</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Voice capture, autonomous agent actions, and bitmap image rendering are not enabled in this workspace yet.
              ORION currently provides the interfaces and, where applicable, production-ready directions for those
              flows.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
function HowItWorksPage() {
  usePageMeta(
    "How It Works",
    "Understand how ORION turns a goal and useful context into a plan, action, validation, refinement, and delivery.",
  );
  const model = ["Goal", "Context", "Understanding", "Reasoning", "Planning", "Action", "Validation", "Result"];
  const loop = ["Understand", "Plan", "Execute", "Validate", "Refine", "Deliver"];
  return (
    <>
      <PageHeader
        eyebrow="THE ORION OPERATING MODEL"
        title="Conversation becomes coordinated action."
        description="ORION keeps the outcome and useful context in view, then helps you shape the work into a clear result without exposing private reasoning."
      />
      <section className="glass rounded-3xl p-5 sm:p-8">
        <p className="text-xs font-extrabold tracking-[0.16em] text-primary">FROM INTENT TO RESULT</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {model.map((step, index) => (
            <article key={step} className="rounded-2xl border border-border bg-background/35 p-4">
              <span className="font-mono text-xs font-bold text-primary">0{index + 1}</span>
              <h2 className="mt-5 text-base font-extrabold text-foreground">{step}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step === "Goal"
                  ? "Define the outcome you want to create."
                  : step === "Context"
                    ? "Bring in the conversation, files, research, or project details that matter."
                    : step === "Understanding"
                      ? "Clarify constraints, audience, evidence, and the decision at hand."
                      : step === "Reasoning"
                        ? "Use ORION to compare options and structure a useful response."
                        : step === "Planning"
                          ? "Turn the direction into tasks, phases, milestones, or a workflow."
                          : step === "Action"
                            ? "Create, research, write, analyze, or move the next piece of work forward."
                            : step === "Validation"
                              ? "Check the output against the goal, evidence, and constraints."
                              : "Save, share, or carry the completed output into the next workspace action."}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="glass mt-5 rounded-3xl p-5 sm:p-8">
        <p className="text-xs font-extrabold tracking-[0.16em] text-primary">THE ORION OPERATING LOOP</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
          A focused loop for ambitious work.
        </h2>
        <div className="mt-6 grid gap-3 md:grid-cols-6">
          {loop.map((step, index) => (
            <div key={step} className="rounded-2xl border border-border bg-primary/5 p-4">
              <span className="text-xs font-extrabold text-primary">0{index + 1}</span>
              <p className="mt-4 text-sm font-extrabold text-foreground">{step}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-6 text-muted-foreground">
          Start in Chat, Research, Files, Creation, Projects, Roadmaps, or Workflows. Each area supports one part of the
          same loop, so the work can progress without losing the context that makes it useful.
        </p>
      </section>
    </>
  );
}
function Sidebar({ user, onNewChat, openAuth, signOut, collapsed, setCollapsed }) {
  const location = useLocation();
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-background/70 px-3 py-4 backdrop-blur-xl lg:flex lg:flex-col",
        collapsed ? "w-[76px]" : "w-[252px]",
      )}
    >
      <div className={cn("mb-6 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        <OrionMark compact={collapsed} />
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className="focus-ring rounded-lg p-2 text-muted-foreground hover:bg-accent"
          >
            <PanelLeftClose size={17} />
          </button>
        )}
      </div>
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          className="focus-ring mx-auto mb-5 rounded-lg p-2 text-muted-foreground hover:bg-accent"
        >
          <PanelLeftOpen size={17} />
        </button>
      )}
      <button
        onClick={onNewChat}
        className={cn(
          "focus-ring mb-5 flex items-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground",
          collapsed ? "h-10 w-10 justify-center self-center" : "min-h-11 justify-center gap-2 px-3",
        )}
      >
        <SquarePen size={17} />
        {!collapsed && "New chat"}
      </button>
      <nav aria-label="ORION workspace navigation" className="min-h-0 flex-1 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p
              className={cn(
                "mb-2 px-3 text-[10px] font-extrabold tracking-[0.16em] text-muted-foreground",
                collapsed && "sr-only",
              )}
            >
              {group.label}
            </p>
            {group.items.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  cn(
                    "focus-ring mb-1 flex items-center rounded-xl px-3 py-2.5 text-sm font-bold",
                    isActive || (to === "/chat" && location.pathname.startsWith("/chat"))
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    collapsed && "justify-center px-2",
                  )
                }
              >
                <Icon size={18} />
                {!collapsed && <span className="ml-3">{label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="border-t border-border pt-3">
        <NavLink
          to="/saved"
          className={({ isActive }) =>
            cn(
              "focus-ring mb-1 flex items-center rounded-xl px-3 py-2.5 text-sm font-bold",
              isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent",
              collapsed && "justify-center",
            )
          }
        >
          <Star size={18} />
          {!collapsed && <span className="ml-3">Saved</span>}
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "focus-ring mb-3 flex items-center rounded-xl px-3 py-2.5 text-sm font-bold",
              isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent",
              collapsed && "justify-center",
            )
          }
        >
          <Settings2 size={18} />
          {!collapsed && <span className="ml-3">Settings</span>}
        </NavLink>
        {user ? (
          <div className={cn("flex items-center gap-2 rounded-xl bg-muted/70 p-2", collapsed && "justify-center")}>
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-primary/15 text-xs font-extrabold text-primary">
              {user.picture ? (
                <img src={user.picture} alt="" className="h-full w-full object-cover" />
              ) : (
                (user.name || "O").slice(0, 1)
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-extrabold text-foreground">{user.name || "ORION member"}</p>
                <button
                  onClick={signOut}
                  className="focus-ring rounded text-xs font-bold text-muted-foreground hover:text-primary"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={openAuth}
            className={cn(
              "focus-ring flex w-full items-center rounded-xl bg-muted p-2 text-sm font-bold text-muted-foreground hover:bg-accent",
              collapsed ? "justify-center" : "gap-2",
            )}
          >
            <LockKeyhole size={17} />
            {!collapsed && "Sign in to sync"}
          </button>
        )}
      </div>
    </aside>
  );
}
function AppShell({ children, user, openAuth, signOut }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  return (
    <>
      <Sidebar
        user={user}
        openAuth={openAuth}
        signOut={signOut}
        onNewChat={() => navigate("/chat?new=1")}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setMobile(true)}
          aria-label="Open navigation"
          className="focus-ring rounded-xl p-2 text-muted-foreground hover:bg-accent"
        >
          <Menu size={20} />
        </button>
        <OrionMark compact />
        <Link to="/chat" className="focus-ring rounded-xl bg-primary p-2 text-primary-foreground">
          <SquarePen size={18} />
        </Link>
      </header>
      {mobile && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            onClick={() => setMobile(false)}
            aria-label="Close navigation"
            className="absolute inset-0 bg-background/75"
          />
          <nav aria-label="Mobile workspace navigation" className="glass relative h-full w-[min(19rem,86vw)] p-4">
            <div className="mb-5 flex items-center justify-between">
              <OrionMark />
              <button
                onClick={() => setMobile(false)}
                aria-label="Close navigation"
                className="focus-ring rounded-xl p-2 text-muted-foreground hover:bg-accent"
              >
                <X size={18} />
              </button>
            </div>
            <button
              onClick={() => {
                navigate("/chat?new=1");
                setMobile(false);
              }}
              className="focus-ring mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-extrabold text-primary-foreground"
            >
              <SquarePen size={17} />
              New chat
            </button>
            {[
              ...navGroups.flatMap((group) => group.items),
              ["/saved", "Saved", Star],
              ["/settings", "Settings", Settings2],
            ].map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobile(false)}
                className={({ isActive }) =>
                  cn(
                    "focus-ring mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold",
                    isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent",
                  )
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
      <main className={cn("min-h-screen px-4 py-6 sm:px-8 lg:py-8", collapsed ? "lg:ml-[76px]" : "lg:ml-[252px]")}>
        {children}
      </main>
    </>
  );
}
function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-extrabold tracking-[0.16em] text-primary">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold tracking-[-0.035em] text-foreground sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
function RequireAuth({ user, openAuth, children }) {
  return user ? (
    children
  ) : (
    <div className="glass mx-auto mt-16 max-w-lg rounded-3xl p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <LockKeyhole size={22} />
      </div>
      <h2 className="mt-5 text-xl font-extrabold text-foreground">Save this to your private workspace</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Sign in to sync conversations, projects, files, preferences, and generated outputs securely.
      </p>
      <PrimaryButton onClick={openAuth} className="mt-6">
        <Sparkles size={16} />
        Sign in to continue
      </PrimaryButton>
    </div>
  );
}
function Dashboard({ user, openAuth }) {
  usePageMeta("Workspace Overview", "A unified overview of your ORION chats, projects, recent work, and next actions.");
  const navigate = useNavigate();
  const quick = [
    ["Start chat", MessageSquareText, "/chat?new=1"],
    ["Create document", FileText, "/create"],
    ["Generate image", Image, "/create?type=image"],
    ["Build roadmap", Target, "/roadmap"],
    ["Create workflow", Workflow, "/workflows"],
    ["Analyze file", FileCode2, "/files"],
    ["Start project", FolderKanban, "/projects?new=1"],
    ["Research topic", Globe2, "/research"],
  ];
  return (
    <>
      <PageHeader
        eyebrow="ORION / OVERVIEW"
        title="Good evening. What will we build today?"
        description="Your operational context is ready. Pick an intention, and ORION will help you turn it into movement."
        action={
          <PrimaryButton onClick={() => navigate("/chat?new=1")}>
            <SquarePen size={16} />
            New conversation
          </PrimaryButton>
        }
      />
      <section aria-label="Quick actions" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quick.map(([label, Icon, route]) => (
          <button
            key={label}
            onClick={() =>
              user || ["Create document", "Generate image", "Research topic"].includes(label)
                ? navigate(route)
                : openAuth()
            }
            className="glass focus-ring group flex items-center gap-3 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/30"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon size={18} />
            </span>
            <span className="text-sm font-extrabold text-foreground">{label}</span>
            <ChevronRight size={16} className="ml-auto text-muted-foreground" />
          </button>
        ))}
      </section>
      <section className="mt-8 grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="glass rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold">Active projects</h2>
              <p className="mt-1 text-sm text-muted-foreground">Context that is already moving forward.</p>
            </div>
            <Link
              to="/projects"
              className="focus-ring rounded-lg px-2 py-1 text-xs font-extrabold text-primary hover:bg-accent"
            >
              View all
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {seedProjects.map((project) => (
              <Link
                key={project.id}
                to="/projects"
                className="focus-ring block rounded-2xl border border-border bg-background/35 p-4 hover:bg-accent/45"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-foreground">{project.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                  </div>
                  <span className="font-extrabold text-primary">{project.progress}%</span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold">Operational pulse</h2>
              <span className="text-xs font-bold text-success">● In flow</span>
            </div>
            <div className="mt-5 space-y-4">
              {[
                ["3", "active projects"],
                ["8", "saved outputs"],
                ["2h 14m", "focus this week"],
              ].map(([value, label]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="font-mono text-sm font-bold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={17} className="text-primary" />
              <h2 className="font-extrabold">Suggested next move</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Turn your launch context into a milestone roadmap with owners, evidence, and decision gates.
            </p>
            <button
              onClick={() => (user ? navigate("/roadmap") : openAuth())}
              className="focus-ring mt-4 inline-flex items-center gap-2 rounded-lg text-sm font-extrabold text-primary"
            >
              Build the roadmap <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
function renderLegacyMessage(content) {
  return (
    <div className="space-y-2 text-sm leading-6 text-foreground">
      {content.split("\n").map((line, index) =>
        line.startsWith("## ") ? (
          <h3 key={index} className="mt-3 text-base font-extrabold">
            {line.slice(3)}
          </h3>
        ) : /^\d\. /.test(line) ? (
          <p key={index}>
            <span className="font-bold text-primary">{line.slice(0, 2)}</span>
            {line.slice(2)}
          </p>
        ) : line.startsWith("- ") ? (
          <p key={index}>• {line.slice(2)}</p>
        ) : line ? (
          <p key={index}>{line}</p>
        ) : null,
      )}
    </div>
  );
}
function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}
function tableCells(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, "|"));
}
function renderInline(value, keyPrefix = "inline") {
  const parts = [];
  const expression = /(`[^`]*`|\[([^\]]+)\]\(([^\s)]+)(?:\s+[^)]*)?\)|(\*\*|__)([\s\S]+?)\4|(\*|_)([^*_\n]+?)\6)/g;
  let cursor = 0;
  let match;
  let index = 0;
  while ((match = expression.exec(value)) !== null) {
    if (match.index > cursor) parts.push(value.slice(cursor, match.index));
    const key = `${keyPrefix}-${index}`;
    if (match[1].startsWith("`")) {
      parts.push(
        <code key={key} className="orion-inline-code">
          {match[1].slice(1, -1)}
        </code>,
      );
    } else if (match[2] && match[3]) {
      const href = /^(https?:\/\/|mailto:)/i.test(match[3]) ? match[3] : "#";
      parts.push(
        <a key={key} href={href} target={href === "#" ? undefined : "_blank"} rel="noopener noreferrer">
          {renderInline(match[2], `${key}-link`)}
        </a>,
      );
    } else if (match[4]) {
      parts.push(<strong key={key}>{renderInline(match[5], `${key}-strong`)}</strong>);
    } else if (match[6]) {
      parts.push(<em key={key}>{renderInline(match[7], `${key}-em`)}</em>);
    }
    cursor = expression.lastIndex;
    index += 1;
  }
  if (cursor < value.length) parts.push(value.slice(cursor));
  return parts.length ? parts : value;
}
function renderMessage(content) {
  const lines = String(content || "")
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const blocks = [];
  let lineIndex = 0;
  let blockIndex = 0;
  const nextKey = () => `block-${blockIndex++}`;
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    if (!line.trim()) {
      lineIndex += 1;
      continue;
    }
    const fence = line.match(/^\s*```([^`]*)$/);
    if (fence) {
      const codeLines = [];
      lineIndex += 1;
      while (lineIndex < lines.length && !/^\s*```\s*$/.test(lines[lineIndex])) {
        codeLines.push(lines[lineIndex]);
        lineIndex += 1;
      }
      if (lineIndex < lines.length) lineIndex += 1;
      blocks.push(
        <pre key={nextKey()} className="orion-code-block" data-language={fence[1].trim() || undefined}>
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }
    const heading = line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const Tag = `h${Math.min(6, heading[1].length)}`;
      blocks.push(<Tag key={nextKey()}>{renderInline(heading[2], `heading-${lineIndex}`)}</Tag>);
      lineIndex += 1;
      continue;
    }
    if (/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      blocks.push(<hr key={nextKey()} />);
      lineIndex += 1;
      continue;
    }
    if (line.includes("|") && lineIndex + 1 < lines.length && isTableSeparator(lines[lineIndex + 1])) {
      const headers = tableCells(line);
      const rows = [];
      lineIndex += 2;
      while (lineIndex < lines.length && lines[lineIndex].includes("|") && lines[lineIndex].trim()) {
        rows.push(tableCells(lines[lineIndex]));
        lineIndex += 1;
      }
      blocks.push(
        <div key={nextKey()} className="orion-table-wrap">
          <table>
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={`${header}-${index}`}>{renderInline(header, `th-${index}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {headers.map((_, cellIndex) => (
                    <td key={`cell-${rowIndex}-${cellIndex}`}>
                      {renderInline(row[cellIndex] || "", `cell-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      const quote = [];
      while (lineIndex < lines.length && /^\s*>\s?/.test(lines[lineIndex])) {
        quote.push(lines[lineIndex].replace(/^\s*>\s?/, ""));
        lineIndex += 1;
      }
      blocks.push(
        <blockquote key={nextKey()}>
          {quote.map((quoteLine, index) => (
            <p key={index}>{renderInline(quoteLine, `quote-${index}`)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }
    const listMatch = line.match(/^(\s*)(?:([-+*])\s+(?:\[([ xX])\]\s+)?|(\d+)\.\s+)(.+)$/);
    if (listMatch) {
      const ordered = Boolean(listMatch[4]);
      const entries = [];
      while (lineIndex < lines.length) {
        const item = lines[lineIndex].match(/^(\s*)(?:([-+*])\s+(?:\[([ xX])\]\s+)?|(\d+)\.\s+)(.+)$/);
        if (!item || Boolean(item[4]) !== ordered) break;
        entries.push({ text: item[5], checked: item[3] ? item[3].toLowerCase() === "x" : null });
        lineIndex += 1;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List
          key={nextKey()}
          className={entries.some((entry) => entry.checked !== null) ? "orion-checklist" : undefined}
        >
          {entries.map((entry, index) => (
            <li key={index} className={entry.checked !== null ? "orion-checklist-item" : undefined}>
              {entry.checked !== null && (
                <span aria-hidden="true" className={cn("orion-check", entry.checked && "is-checked")}>
                  {entry.checked ? "✓" : ""}
                </span>
              )}
              <span>{renderInline(entry.text, `list-${index}`)}</span>
            </li>
          ))}
        </List>,
      );
      continue;
    }
    const paragraph = [line.trim()];
    lineIndex += 1;
    while (lineIndex < lines.length && lines[lineIndex].trim()) {
      const candidate = lines[lineIndex];
      if (
        /^\s*```/.test(candidate) ||
        /^\s*(#{1,6})\s+/.test(candidate) ||
        /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(candidate) ||
        /^\s*>\s?/.test(candidate) ||
        /^(\s*)(?:([-+*])\s+(?:\[[ xX]\]\s+)?|(\d+)\.\s+)/.test(candidate) ||
        (candidate.includes("|") && lineIndex + 1 < lines.length && isTableSeparator(lines[lineIndex + 1]))
      )
        break;
      paragraph.push(candidate.trim());
      lineIndex += 1;
    }
    blocks.push(<p key={nextKey()}>{renderInline(paragraph.join(" "), `paragraph-${lineIndex}`)}</p>);
  }
  return <div className="orion-response">{blocks}</div>;
}
function ChatPage({ user, openAuth, toast }) {
  usePageMeta(
    "AI Conversation Workspace",
    "Chat with ORION and turn questions into structured plans, research, and useful outputs.",
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [chats, setChats] = useState(seedChats);
  const [selectedId, setSelectedId] = useState(seedChats[0].id);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("Reasoning");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [tools, setTools] = useState(false);
  const [responseLanguage, setResponseLanguage] = useState("English");
  const selected = chats.find((chat) => chat.id === selectedId) || chats[0];
  useEffect(() => {
    let live = true;
    const load = async () => {
      if (!user) return;
      try {
        const [data, savedSettings] = await Promise.all([
          window.genmb.kv.list(`orion:chat:${user.id}:`),
          window.genmb.kv.get(`orion:settings:${user.id}`),
        ]);
        if (
          live &&
          savedSettings &&
          typeof savedSettings === "object" &&
          responseLanguages.includes(savedSettings.language)
        ) {
          setResponseLanguage(savedSettings.language);
        }
        const saved = data.data.map((row) => row.value).filter((value) => value && value.id);
        if (live && saved.length) {
          setChats(saved.sort((a, b) => b.updatedAt - a.updatedAt));
          setSelectedId(saved[0].id);
        }
      } catch (err) {
        toast("error", "Could not load saved conversations", err.message);
      }
    };
    void load();
    return () => {
      live = false;
    };
  }, [user, toast]);
  useEffect(() => {
    if (new URLSearchParams(location.search).get("new") === "1") {
      const id = crypto.randomUUID();
      setChats((current) => [{ id, title: "New conversation", updatedAt: Date.now(), messages: [] }, ...current]);
      setSelectedId(id);
      navigate("/chat", { replace: true });
    }
  }, [location.search, navigate]);
  const generateResponse = async (messages) =>
    window.genmb.ai.complete(buildOrionPrompt(messages, mode, responseLanguage), {
      maxTokens: mode === "Deep Research" ? 1200 : 800,
      enableSearch: mode === "Research" || mode === "Deep Research",
    });
  const updateChat = (next) => {
    setChats((current) =>
      current.map((chat) => (chat.id === next.id ? next : chat)).sort((a, b) => b.updatedAt - a.updatedAt),
    );
  };
  const send = async () => {
    if (!input.trim() || busy) return;
    if (!user) {
      openAuth();
      return;
    }
    const question = input.trim();
    const userMessage = { id: crypto.randomUUID(), role: "user", content: question };
    const pendingChat = {
      ...selected,
      title: selected.messages.length ? selected.title : question.slice(0, 42),
      updatedAt: Date.now(),
      messages: [...selected.messages, userMessage],
    };
    setInput("");
    setBusy(true);
    try {
      await window.genmb.kv.set(`orion:chat:${user.id}:${pendingChat.id}`, pendingChat);
      updateChat(pendingChat);
      const content = await generateResponse(pendingChat.messages);
      const next = {
        ...pendingChat,
        updatedAt: Date.now(),
        messages: [...pendingChat.messages, { id: crypto.randomUUID(), role: "assistant", content }],
      };
      await window.genmb.kv.set(`orion:chat:${user.id}:${next.id}`, next);
      updateChat(next);
      toast("success", "Response added", "This conversation is saved to your private workspace.");
    } catch (err) {
      toast("error", "ORION could not complete that request", err.message);
    } finally {
      setBusy(false);
    }
  };
  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast("success", "Copied to clipboard");
    } catch (err) {
      toast("error", "Copy failed", err.message);
    }
  };
  const regenerate = async () => {
    if (busy) return;
    if (!user) {
      openAuth();
      return;
    }
    const lastAssistantIndex = selected.messages.map((message) => message.role).lastIndexOf("assistant");
    if (lastAssistantIndex < 1) return;
    const conversation = selected.messages.slice(0, lastAssistantIndex);
    if (!conversation.some((message) => message.role === "user")) return;
    setBusy(true);
    try {
      const content = await generateResponse(conversation);
      const next = {
        ...selected,
        updatedAt: Date.now(),
        messages: [...conversation, { id: crypto.randomUUID(), role: "assistant", content }],
      };
      await window.genmb.kv.set(`orion:chat:${user.id}:${next.id}`, next);
      updateChat(next);
      toast("success", "Response regenerated", "ORION created a new answer from the same conversation context.");
    } catch (err) {
      toast("error", "Could not regenerate response", err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="-mx-4 -my-6 flex min-h-[calc(100vh-4rem)] sm:-mx-8 lg:-my-8">
      <section className="hidden w-72 shrink-0 border-r border-border bg-background/35 p-4 xl:block">
        <button
          onClick={() => navigate("/chat?new=1")}
          className="focus-ring mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-extrabold text-primary-foreground"
        >
          <Plus size={17} />
          New conversation
        </button>
        <label htmlFor="chat-search" className="sr-only">
          Search chats
        </label>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
          <input
            id="chat-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="focus-ring w-full rounded-xl border border-input bg-muted py-2.5 pl-10 pr-3 text-sm text-foreground"
            placeholder="Search chats"
          />
        </div>
        <div className="mt-5 space-y-1">
          {chats
            .filter((chat) => chat.title.toLowerCase().includes(search.toLowerCase()))
            .map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedId(chat.id)}
                className={cn(
                  "focus-ring w-full rounded-xl px-3 py-3 text-left",
                  selectedId === chat.id ? "bg-accent" : "hover:bg-muted",
                )}
              >
                <p className="truncate text-sm font-bold text-foreground">{chat.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {chat.messages.length ? `${chat.messages.length} messages` : "Ready to begin"}
                </p>
              </button>
            ))}
        </div>
      </section>
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 items-center justify-between border-b border-border px-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold tracking-[0.16em] text-primary">CONVERSATION</p>
            <h1 className="truncate text-sm font-extrabold text-foreground sm:text-base">{selected.title}</h1>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => navigate("/projects?new=1")}
              className="focus-ring hidden rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-accent sm:inline-flex"
            >
              <FolderKanban size={15} className="mr-1.5" />
              Make project
            </button>
            <button
              onClick={() =>
                toast("info", "Conversation tools", "Use the workspace tools in the composer to shape the next action.")
              }
              aria-label="Conversation options"
              className="focus-ring rounded-xl p-2 text-muted-foreground hover:bg-accent"
            >
              <MoreHorizontal size={19} />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {selected.messages.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles size={22} />
                </div>
                <h2 className="mt-5 text-xl font-extrabold">A fresh operational thread</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Describe the result you want. ORION will help shape the work into an outcome, a plan, and useful next
                  actions.
                </p>
              </div>
            ) : (
              selected.messages.map((message) => (
                <article key={message.id} className={cn("group flex", message.role === "user" && "justify-end")}>
                  <div
                    className={cn(
                      "max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[80%]",
                      message.role === "user"
                        ? "rounded-tr-sm bg-secondary text-secondary-foreground"
                        : "rounded-tl-sm border border-primary/15 bg-primary/8",
                    )}
                  >
                    <p
                      className={cn(
                        "mb-2 text-[10px] font-extrabold tracking-[0.13em]",
                        message.role === "user" ? "text-secondary-foreground/70" : "text-primary",
                      )}
                    >
                      {message.role === "user" ? "YOU" : "ORION"}
                    </p>
                    {message.role === "assistant" ? (
                      renderMessage(message.content)
                    ) : (
                      <p className="text-sm leading-6">{message.content}</p>
                    )}
                    {message.role === "assistant" && (
                      <div className="mt-3 flex gap-1 border-t border-border pt-2">
                        <button
                          onClick={() => void copy(message.content)}
                          aria-label="Copy response"
                          className="focus-ring rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => void regenerate()}
                          disabled={busy}
                          aria-label="Regenerate response"
                          className="focus-ring rounded-lg p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-50"
                        >
                          <Sparkles size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}
            {busy && (
              <div className="rounded-2xl border border-primary/15 bg-primary/8 px-4 py-3 text-sm font-bold text-primary">
                <Loader2 size={15} className="mr-2 inline animate-spin" />
                ORION is {mode === "Deep Research" ? "researching" : "composing"}
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-border bg-background/50 p-3 sm:p-5">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <label htmlFor="chat-response-language" className="sr-only">
                AI response language
              </label>
              <select
                id="chat-response-language"
                value={responseLanguage}
                onChange={(event) => setResponseLanguage(event.target.value)}
                disabled={busy}
                className="focus-ring rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-bold text-foreground disabled:opacity-50"
                aria-label="AI response language"
              >
                {responseLanguages.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
              {["Reasoning", "Research", "Deep Research", "Create"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setMode(item);
                    if (item === "Research" || item === "Deep Research") navigate("/research");
                  }}
                  className={cn(
                    "focus-ring rounded-lg px-2.5 py-1.5 text-xs font-bold",
                    mode === item ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  {item}
                </button>
              ))}
              <button
                onClick={() => setTools(!tools)}
                className={cn(
                  "focus-ring rounded-lg px-2.5 py-1.5 text-xs font-bold",
                  tools ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent",
                )}
              >
                Tools
              </button>
            </div>
            {tools && (
              <div className="mb-2 flex gap-2 rounded-xl border border-border bg-card p-2">
                <button
                  onClick={() => navigate("/roadmap")}
                  className="focus-ring rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-accent"
                >
                  Roadmap
                </button>
                <button
                  onClick={() => navigate("/workflows")}
                  className="focus-ring rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-accent"
                >
                  Workflow
                </button>
                <button
                  onClick={() => navigate("/code")}
                  className="focus-ring rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-accent"
                >
                  Code review
                </button>
              </div>
            )}
            <div className="flex items-end gap-2 rounded-2xl border border-input bg-card p-2">
              <button
                onClick={() => navigate("/files")}
                aria-label="Attach files"
                className="focus-ring rounded-xl p-2 text-muted-foreground hover:bg-accent"
              >
                <Paperclip size={18} />
              </button>
              <button
                onClick={() => navigate("/create?type=image")}
                aria-label="Generate image"
                className="focus-ring rounded-xl p-2 text-muted-foreground hover:bg-accent"
              >
                <Image size={18} />
              </button>
              <label htmlFor="chat-composer" className="sr-only">
                Message ORION
              </label>
              <textarea
                id="chat-composer"
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                className="min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-foreground outline-none"
                placeholder="Message ORION…"
              />
              <button
                onClick={() =>
                  toast(
                    "info",
                    "Voice input",
                    "Voice capture can be connected through a browser-supported speech service.",
                  )
                }
                aria-label="Use voice input"
                className="focus-ring rounded-xl p-2 text-muted-foreground hover:bg-accent"
              >
                <Mic size={18} />
              </button>
              <button
                onClick={() => void send()}
                disabled={busy || !input.trim()}
                aria-label="Send message"
                className="focus-ring rounded-xl bg-primary p-2.5 text-primary-foreground disabled:opacity-50"
              >
                <Send size={17} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
function ProjectsPage({ user, openAuth, toast }) {
  usePageMeta(
    "Projects",
    "Create focused ORION project workspaces for goals, tasks, milestones, research, files, and outputs.",
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState(seedProjects);
  const [modal, setModal] = useState(new URLSearchParams(location.search).get("new") === "1");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    const load = async () => {
      if (!user) return;
      try {
        const data = await window.genmb.kv.list(`orion:project:${user.id}:`);
        const saved = data.data.map((row) => row.value).filter((value) => value && value.id);
        if (live && saved.length) setProjects(saved);
      } catch (err) {
        toast("error", "Could not load projects", err.message);
      }
    };
    void load();
    return () => {
      live = false;
    };
  }, [user, toast]);
  const create = async (event) => {
    event.preventDefault();
    if (!user) {
      setModal(false);
      openAuth();
      return;
    }
    if (!name.trim()) {
      toast("error", "Project name is required");
      return;
    }
    setBusy(true);
    const project = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim() || "A focused ORION project workspace.",
      progress: 0,
      goals: 1,
      milestones: 1,
    };
    try {
      await window.genmb.kv.set(`orion:project:${user.id}:${project.id}`, project);
      setProjects((current) => [project, ...current]);
      setModal(false);
      setName("");
      setDescription("");
      navigate("/projects");
      toast("success", "Project created", `${project.name} is ready for goals, tasks, files, and conversations.`);
    } catch (err) {
      toast("error", "Project could not be created", err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="PROJECT MODE"
        title="Projects with their own working context."
        description="Connect goals, tasks, milestones, conversations, files, research, documents, images, roadmaps, workflows, code, and outputs around the work that matters."
        action={
          <PrimaryButton onClick={() => (user ? setModal(true) : openAuth())}>
            <Plus size={17} />
            New project
          </PrimaryButton>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="glass rounded-3xl p-5 transition hover:-translate-y-0.5 hover:border-primary/30"
          >
            <div className="flex justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderKanban size={19} />
              </div>
              <button
                onClick={() =>
                  toast(
                    "info",
                    project.name,
                    "This project includes goals, tasks, milestones, files, notes, conversations, documents, images, roadmaps, workflows, code, and research.",
                  )
                }
                aria-label={`Project details for ${project.name}`}
                className="focus-ring rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
              >
                <MoreHorizontal size={17} />
              </button>
            </div>
            <h2 className="mt-5 text-lg font-extrabold text-foreground">{project.name}</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{project.description}</p>
            <div className="mt-5 flex justify-between text-xs">
              <span className="font-bold text-muted-foreground">
                {project.goals} goals · {project.milestones} milestones
              </span>
              <span className="font-extrabold text-primary">{project.progress}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => navigate("/chat")}
                className="focus-ring flex-1 rounded-xl bg-secondary px-3 py-2 text-xs font-extrabold text-secondary-foreground hover:bg-accent"
              >
                Open context
              </button>
              <button
                onClick={() => navigate("/roadmap")}
                className="focus-ring rounded-xl border border-border px-3 py-2 text-xs font-extrabold text-muted-foreground hover:bg-accent"
              >
                Plan
              </button>
            </div>
          </article>
        ))}
      </div>
      {modal && (
        <Modal title="Start a new project" onClose={() => setModal(false)}>
          <form noValidate onSubmit={create} className="space-y-4">
            <div>
              <label htmlFor="project-name" className="mb-1.5 block text-sm font-bold">
                Project name
              </label>
              <input
                id="project-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="focus-ring w-full rounded-xl border border-input bg-muted px-3 py-2.5 text-sm text-foreground"
                placeholder="e.g. Product launch system"
              />
            </div>
            <div>
              <label htmlFor="project-description" className="mb-1.5 block text-sm font-bold">
                Description
              </label>
              <textarea
                id="project-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="focus-ring w-full resize-none rounded-xl border border-input bg-muted px-3 py-2.5 text-sm text-foreground"
                placeholder="What outcome will this project create?"
              />
            </div>
            <PrimaryButton type="submit" disabled={busy} className="w-full">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}Create project
            </PrimaryButton>
          </form>
        </Modal>
      )}
    </>
  );
}
function FilesPage({ user, openAuth, toast }) {
  usePageMeta(
    "File Intelligence",
    "Organize, inspect, analyze, summarize, and ask questions about your project files in ORION.",
  );
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [files, setFiles] = useState(seedFiles);
  const [selected, setSelected] = useState(seedFiles[0]);
  const [busy, setBusy] = useState(false);
  const [localUploads, setLocalUploads] = useState({});
  const addFile = async (event) => {
    const source = event.target.files?.[0];
    event.target.value = "";
    if (!source) return;
    if (!user) {
      openAuth();
      return;
    }
    const validation = window.genmb.storage.validate(source, {
      accept: "image/*,application/pdf,.docx,.txt,.csv,.xlsx,text/plain,text/csv",
      maxSize: 52428800,
    });
    if (!validation.ok) {
      toast("error", "File cannot be uploaded", validation.message);
      return;
    }
    setBusy(true);
    try {
      const uploaded = await window.genmb.storage.upload(source, { folder: `orion/${user.id}` });
      const file = {
        id: crypto.randomUUID(),
        name: uploaded.filename,
        kind: uploaded.contentType.startsWith("image/")
          ? "Image"
          : uploaded.filename.split(".").pop()?.toUpperCase() || "File",
        size: `${Math.max(1, Math.round(uploaded.size / 1024))} KB`,
        summary: "Uploaded source material ready for ORION file intelligence.",
        url: uploaded.url,
        contentType: uploaded.contentType,
      };
      await window.genmb.kv.set(`orion:file:${user.id}:${file.id}`, file);
      setLocalUploads((current) => ({ ...current, [file.id]: source }));
      setFiles((current) => [file, ...current]);
      setSelected(file);
      toast("success", "File uploaded", `${file.name} is saved and ready for analysis.`);
    } catch (err) {
      toast("error", "Could not upload file", err.message);
    } finally {
      setBusy(false);
    }
  };
  const analyze = async (action) => {
    if (!user) {
      openAuth();
      return;
    }
    const source = localUploads[selected.id];
    if (!source || !selected.contentType?.startsWith("image/")) {
      toast(
        "info",
        "Select an uploaded image",
        "Image analysis requires an image you uploaded in this browser session.",
      );
      return;
    }
    setBusy(true);
    try {
      const result = await window.genmb.ai.analyzeImage(
        source,
        `${action}: provide a clear, useful result for this image.`,
      );
      await window.genmb.kv.set(`orion:file-analysis:${user.id}:${selected.id}`, {
        fileId: selected.id,
        action,
        result,
        createdAt: Date.now(),
      });
      toast("success", `${action} complete`, result.slice(0, 160));
    } catch (err) {
      toast("error", `${action} could not run`, err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="FILE INTELLIGENCE"
        title="Bring your source material into focus."
        description="Use files as working context: analyze, summarize, extract information, ask questions, or generate a useful study output."
        action={
          <>
            <input
              ref={fileInput}
              type="file"
              accept="image/*,application/pdf,.docx,.txt,.csv,.xlsx,text/plain,text/csv"
              onChange={(event) => void addFile(event)}
              className="sr-only"
            />
            <PrimaryButton onClick={() => fileInput.current?.click()} disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}Upload file
            </PrimaryButton>
          </>
        }
      />
      <div className="grid min-h-[570px] gap-4 lg:grid-cols-[0.82fr_1.18fr]">
        <section className="glass rounded-3xl p-4">
          <div className="mb-3 flex justify-between">
            <h2 className="font-extrabold">Workspace files</h2>
            <span className="text-xs font-bold text-muted-foreground">{files.length} files</span>
          </div>
          <div className="space-y-2">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelected(file)}
                className={cn(
                  "focus-ring flex w-full items-center gap-3 rounded-2xl border p-3 text-left",
                  selected.id === file.id ? "border-primary/35 bg-primary/10" : "border-transparent hover:bg-accent",
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-primary">
                  <FileText size={17} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{file.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {file.kind} · {file.size}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/30 p-4 text-center">
            <Upload size={18} className="mx-auto text-primary" />
            <p className="mt-2 text-sm font-bold">File intake ready</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              PDF, DOCX, TXT, CSV, XLSX, images, and code file interfaces are supported here.
            </p>
          </div>
        </section>
        <section className="glass rounded-3xl p-5 sm:p-6">
          <p className="text-xs font-extrabold tracking-[0.15em] text-primary">{selected.kind} PREVIEW</p>
          <h2 className="mt-1 text-xl font-extrabold">{selected.name}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{selected.summary}</p>
          <div className="mt-6 flex min-h-56 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background/45">
            {selected.contentType?.startsWith("image/") && selected.url ? (
              <img src={selected.url} alt={selected.name} className="max-h-80 w-full object-contain" />
            ) : (
              <div className="text-center">
                <FileText size={34} className="mx-auto text-primary" />
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  {selected.kind === "Code" ? "const workspace = createORION();" : "SOURCE MATERIAL READY FOR ANALYSIS"}
                </p>
              </div>
            )}
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <SecondaryButton onClick={() => void analyze("Analyze")} disabled={busy}>
              <BrainCircuit size={16} />
              Analyze
            </SecondaryButton>
            <SecondaryButton onClick={() => void analyze("Summarize")} disabled={busy}>
              <FileText size={16} />
              Summarize
            </SecondaryButton>
            <SecondaryButton onClick={() => void analyze("Extract information")} disabled={busy}>
              <Search size={16} />
              Extract information
            </SecondaryButton>
            <SecondaryButton onClick={() => void analyze("Generate study guide")} disabled={busy}>
              <BookOpen size={16} />
              Study guide
            </SecondaryButton>
          </div>
          <button
            onClick={() => navigate("/chat")}
            className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground"
          >
            <MessageSquareText size={16} />
            Ask ORION about this file
          </button>
        </section>
      </div>
    </>
  );
}
function CreatePage({ user, openAuth, toast }) {
  usePageMeta(
    "Creation Studio",
    "Create documents, reports, study notes, research outputs, image directions, roadmaps, workflows, and code in ORION.",
  );
  const location = useLocation();
  const [selected, setSelected] = useState("Document");
  const [brief, setBrief] = useState("");
  const [artifact, setArtifact] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(location.search).get("type") === "image") setSelected("Image");
  }, [location.search]);
  useEffect(() => {
    let live = true;
    const loadLatest = async () => {
      if (!user) return;
      try {
        const data = await window.genmb.kv.list(`orion:output:${user.id}:`);
        const saved = data.data.map((row) => row.value).filter((value) => value && value.content);
        if (live && saved.length) setArtifact(saved.sort((a, b) => b.createdAt - a.createdAt)[0]);
      } catch (err) {
        toast("error", "Could not load your latest creation", err.message);
      }
    };
    void loadLatest();
    return () => {
      live = false;
    };
  }, [user, toast]);
  const generate = async () => {
    if (!user) {
      openAuth();
      return;
    }
    if (!brief.trim()) {
      toast("error", "Describe what you want to create");
      return;
    }
    setBusy(true);
    try {
      const content = await window.genmb.ai.complete(buildCreationPrompt(selected, brief.trim()), { maxTokens: 1200 });
      const output = {
        id: crypto.randomUUID(),
        kind: selected,
        brief: brief.trim(),
        content,
        createdAt: Date.now(),
      };
      await window.genmb.kv.set(`orion:output:${user.id}:${output.id}`, output);
      setArtifact(output);
      setBrief("");
      toast(
        "success",
        selected === "Image" ? "Image direction created" : `${selected} created`,
        selected === "Image"
          ? "ORION created a production-ready visual prompt. Image rendering is not enabled in this workspace."
          : "Your generated result is saved to your private workspace.",
      );
    } catch (err) {
      toast("error", "ORION could not create that output", err.message);
    } finally {
      setBusy(false);
    }
  };
  const copyArtifact = async () => {
    if (!artifact) return;
    try {
      await navigator.clipboard.writeText(artifact.content);
      toast("success", "Creation copied", "The generated result is ready to paste into your next tool.");
    } catch (err) {
      toast("error", "Copy failed", err.message);
    }
  };
  const chosen = createTypes.find(([name]) => name === selected)[1];
  const ChosenIcon = chosen;
  return (
    <>
      <PageHeader
        eyebrow="CREATION STUDIO"
        title="Make the useful thing."
        description="Describe the outcome and ORION generates an editable result directly in this workspace."
      />
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="glass rounded-3xl p-4">
          <p className="mb-3 px-1 text-xs font-extrabold tracking-[0.15em] text-muted-foreground">CHOOSE AN OUTPUT</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {createTypes.map(([name, Icon]) => (
              <button
                key={name}
                onClick={() => setSelected(name)}
                className={cn(
                  "focus-ring rounded-2xl border p-3 text-left",
                  selected === name ? "border-primary/35 bg-primary/10" : "border-transparent hover:bg-accent",
                )}
              >
                <Icon size={17} className="text-primary" />
                <p className="mt-3 text-sm font-extrabold">{name}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Generate an editable result.</p>
              </button>
            ))}
          </div>
        </section>
        <section className="glass rounded-3xl p-5 sm:p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ChosenIcon size={21} />
          </div>
          <h2 className="mt-4 text-xl font-extrabold">Create a {selected.toLowerCase()}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Give ORION the outcome, audience, tone, and constraints. Your completed result will appear below in an
            editable, chat-style format.
            {selected === "Image" &&
              " This workspace can create the art direction and generation prompt, but an image-rendering API is not enabled."}
          </p>
          <label htmlFor="creation-brief" className="mb-2 mt-5 block text-sm font-bold">
            Creation brief
          </label>
          <textarea
            id="creation-brief"
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            rows={8}
            disabled={busy}
            className="focus-ring w-full resize-none rounded-2xl border border-input bg-muted/70 p-4 text-sm leading-6 text-foreground disabled:opacity-60"
            placeholder={`What should this ${selected.toLowerCase()} accomplish?`}
          />
          <PrimaryButton onClick={() => void generate()} disabled={busy || !brief.trim()} className="mt-6 w-full">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <WandSparkles size={16} />}Create {selected}
          </PrimaryButton>
        </section>
      </div>
      {busy && (
        <section className="glass mt-5 rounded-3xl p-5">
          <Loader2 size={17} className="mr-2 inline animate-spin text-primary" />
          <span className="text-sm font-bold text-foreground">ORION is creating your {selected.toLowerCase()}…</span>
        </section>
      )}
      {artifact && !busy && (
        <section className="glass mt-5 overflow-hidden rounded-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-primary/5 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <WandSparkles size={17} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold tracking-[0.15em] text-primary">
                  ORION GENERATED {artifact.kind.toUpperCase()}
                </p>
                <h2 className="text-sm font-extrabold text-foreground">Ready to refine, copy, or use in a project</h2>
              </div>
            </div>
            <SecondaryButton onClick={() => void copyArtifact()}>
              <Copy size={15} />
              Copy result
            </SecondaryButton>
          </div>
          <div className="p-5 sm:p-6">{renderMessage(artifact.content)}</div>
          {artifact.kind === "Image" && (
            <div className="border-t border-border bg-muted/35 px-5 py-4 text-sm leading-6 text-muted-foreground">
              <strong className="text-foreground">Image rendering note:</strong> ORION generated the visual direction
              above, not a bitmap image. Upload a reference image in Files to use the enabled image-analysis tool, or
              connect an image-rendering capability to produce pixels.
            </div>
          )}
        </section>
      )}
    </>
  );
}
function RoadmapPage({ user, openAuth, toast }) {
  usePageMeta(
    "Roadmap Builder",
    "Turn a goal into phases, skills, tasks, resources, milestones, projects, and evaluation with ORION.",
  );
  const [goal, setGoal] = useState("Launch ORION as the preferred AI operating workspace for ambitious teams.");
  const [busy, setBusy] = useState(false);
  const stages = [
    ["Goal", "A focused, measurable destination"],
    ["Phases", "Narrative · prototype · launch"],
    ["Skills", "Research, product, storytelling"],
    ["Tasks", "Prioritized moves with owners"],
    ["Resources", "Evidence, docs, and references"],
    ["Milestones", "Decision gates that create momentum"],
    ["Projects", "Connected workspaces and context"],
    ["Evaluation", "Signals, learning, and refinement"],
  ];
  const save = async () => {
    if (!user) {
      openAuth();
      return;
    }
    if (!goal.trim()) {
      toast("error", "Add a goal to build the roadmap");
      return;
    }
    setBusy(true);
    try {
      await window.genmb.kv.set(`orion:roadmap:${user.id}:${crypto.randomUUID()}`, {
        goal: goal.trim(),
        stages,
        createdAt: Date.now(),
      });
      toast("success", "Roadmap saved", "Your goal and operating sequence are now stored in ORION.");
    } catch (err) {
      toast("error", "Roadmap could not be saved", err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="ROADMAP BUILDER"
        title="Turn a goal into a way forward."
        description="ORION organizes the work from outcome through evaluation, without losing the projects and evidence that make it real."
        action={
          <PrimaryButton onClick={() => void save()} disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}Save roadmap
          </PrimaryButton>
        }
      />
      <section className="glass rounded-3xl p-5 sm:p-8">
        <label htmlFor="goal" className="text-sm font-bold">
          The goal
        </label>
        <textarea
          id="goal"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          rows={3}
          className="focus-ring mt-2 w-full resize-none rounded-2xl border border-input bg-muted/60 p-4 text-sm leading-6 text-foreground"
        />
        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {stages.map(([title, desc], index) => (
            <article key={title} className="rounded-2xl border border-border bg-background/35 p-4">
              <span className="font-mono text-xs font-bold text-primary">0{index + 1}</span>
              <h2 className="mt-6 text-base font-extrabold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
function WorkflowsPage({ user, openAuth, toast }) {
  usePageMeta(
    "Workflow Builder",
    "Design clear, repeatable ORION workflows from research and planning through deployment, monitoring, and improvement.",
  );
  const nodes = [
    "Research",
    "Planning",
    "Architecture",
    "Development",
    "Testing",
    "Deployment",
    "Monitoring",
    "Improvement",
  ];
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!user) {
      openAuth();
      return;
    }
    setBusy(true);
    try {
      await window.genmb.kv.set(`orion:workflow:${user.id}:${crypto.randomUUID()}`, {
        nodes,
        active,
        createdAt: Date.now(),
      });
      toast("success", "Workflow saved", "The workflow is now available as reusable project context.");
    } catch (err) {
      toast("error", "Workflow could not be saved", err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="WORKFLOW BUILDER"
        title="Make complex work visible."
        description="Use a clear operating path to connect research, planning, building, quality checks, deployment, and improvement."
        action={
          <PrimaryButton onClick={() => void save()} disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Workflow size={16} />}Save workflow
          </PrimaryButton>
        }
      />
      <section className="glass rounded-3xl p-5 sm:p-8">
        <div className="mb-8 flex flex-wrap justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">Product delivery workflow</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select a stage to make it the current focus.</p>
          </div>
          <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary">
            {nodes[active]} IN FOCUS
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {nodes.map((node, index) => (
            <button
              key={node}
              onClick={() => setActive(index)}
              className={cn(
                "focus-ring rounded-2xl border p-4 text-left",
                active === index
                  ? "border-primary bg-primary/12 shadow-[0_0_28px_rgba(55,150,255,0.16)]"
                  : "border-border bg-background/35 hover:bg-accent",
              )}
            >
              <span className="font-mono text-xs font-bold text-primary">0{index + 1}</span>
              <h2 className="mt-5 text-base font-extrabold">{node}</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {index === active ? "Current focus and decision point." : "Connected workflow stage."}
              </p>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
function ResearchPage({ user, toast }) {
  usePageMeta(
    "Research Workspace",
    "Run structured live web and news research in ORION with sources, key findings, analysis, comparisons, conclusions, and next steps.",
  );
  const [query, setQuery] = useState("");
  const [type, setType] = useState("web");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = async (event) => {
    event.preventDefault();
    if (!query.trim()) {
      setError("Enter a topic to research.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const next =
        type === "news"
          ? await window.genmb.search.news(query, { numResults: 8 })
          : await window.genmb.search.web(query, { numResults: 8 });
      setResults(next);
      if (user)
        await window.genmb.kv.set(`orion:research:${user.id}:${crypto.randomUUID()}`, {
          query,
          type,
          count: next.length,
          createdAt: Date.now(),
        });
    } catch (err) {
      setError(err.message);
      toast("error", "Research could not run", err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="LIVE RESEARCH"
        title="Evidence, not invented citations."
        description="Search the live web or recent news, then use resulting sources as a grounded foundation for your next decision."
      />
      <form noValidate onSubmit={run} className="glass rounded-3xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="research" className="sr-only">
            Research topic
          </label>
          <div className="relative flex-1">
            <Search size={17} className="absolute left-4 top-3.5 text-muted-foreground" />
            <input
              id="research"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="focus-ring w-full rounded-xl border border-input bg-muted/60 py-3 pl-10 pr-4 text-sm text-foreground"
              placeholder="What do you want to investigate?"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("web")}
              className={cn(
                "focus-ring rounded-xl px-3 text-sm font-bold",
                type === "web" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              Research
            </button>
            <button
              type="button"
              onClick={() => setType("news")}
              className={cn(
                "focus-ring rounded-xl px-3 text-sm font-bold",
                type === "news" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              Deep Research
            </button>
            <PrimaryButton type="submit" disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}Search
            </PrimaryButton>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </form>
      {busy && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((value) => (
            <div key={value} className="glass h-48 animate-pulse rounded-3xl" />
          ))}
        </div>
      )}
      {!busy && !results.length && (
        <section className="mt-5 glass rounded-3xl p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Globe2 size={22} />
          </div>
          <h2 className="mt-4 text-lg font-extrabold">Start a grounded research brief</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Run a live search to populate real sources, then compare evidence and determine a useful next step.
          </p>
        </section>
      )}
      {!busy && results.length > 0 && (
        <section className="mt-5">
          <div className="mb-4 grid gap-3 md:grid-cols-4">
            {[
              ["Key findings", `${results.length} relevant sources`],
              ["Evidence", "Live web results"],
              ["Analysis", "Ready for synthesis"],
              ["Next step", "Save into project"],
            ].map(([label, value]) => (
              <div key={label} className="glass rounded-2xl p-4">
                <p className="text-xs font-extrabold tracking-wide text-primary">{label}</p>
                <p className="mt-2 text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {results.map((result) => (
              <a
                key={result.url}
                href={result.url}
                target="_blank"
                rel="noopener"
                className="glass focus-ring flex gap-4 rounded-3xl p-4 transition hover:-translate-y-0.5 hover:border-primary/30"
              >
                <img
                  src={result.image}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.src = result.favicon || "";
                  }}
                  className="h-16 w-16 shrink-0 rounded-xl bg-muted object-cover"
                />
                <div className="min-w-0">
                  <p className="text-sm font-extrabold leading-5 text-foreground">{result.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{result.snippet}</p>
                  <p className="mt-3 text-xs font-bold text-primary">
                    {result.source}
                    {result.publishedAt ? ` · ${result.publishedAt}` : ""}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
function CodePage({ toast }) {
  usePageMeta(
    "Code Workspace",
    "Review code structure in ORION with file context, readable syntax, copy actions, explanations, debugging, and improvement guidance.",
  );
  const [active, setActive] = useState("App.tsx");
  const code = `export default function LaunchWorkspace() {\n  const [phase, setPhase] = useState('plan')\n\n  return (\n    <section className=\"workspace\">\n      <h1>Ship with focus</h1>\n      <button onClick={() => setPhase('build')}>\n        Continue to build\n      </button>\n    </section>\n  )\n}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast("success", "Code copied to clipboard");
    } catch (err) {
      toast("error", "Copy failed", err.message);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="CODE WORKSPACE"
        title="From architecture to implementation."
        description="Keep project structure, code context, and useful engineering actions in one focused working surface."
      />
      <div className="grid min-h-[570px] gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <section className="glass rounded-3xl p-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <FileCode2 size={17} className="text-primary" />
            <h2 className="font-extrabold">Project tree</h2>
          </div>
          <div className="mt-3 space-y-1">
            {["src", "components", "App.tsx", "main.tsx", "styles", "README.md"].map((file) => (
              <button
                key={file}
                onClick={() => setActive(file)}
                className={cn(
                  "focus-ring flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-mono text-xs",
                  active === file ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent",
                )}
              >
                <ChevronRight size={13} className="text-primary" />
                {file}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-border bg-background/35 p-4">
            <p className="text-xs font-extrabold tracking-wide text-primary">ARCHITECTURE GUIDANCE</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Provider → model → tool calling → context → memory → response → output renderer.
            </p>
          </div>
        </section>
        <section className="glass overflow-hidden rounded-3xl">
          <div className="flex justify-between border-b border-border px-5 py-3">
            <div>
              <p className="font-mono text-xs font-bold">src/{active}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">TypeScript React</p>
            </div>
            <button
              onClick={() => void copy()}
              className="focus-ring inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-muted-foreground hover:bg-accent"
            >
              <Copy size={14} />
              Copy
            </button>
          </div>
          <pre className="overflow-auto p-5 font-mono text-xs leading-6 text-foreground">
            <code>{code}</code>
          </pre>
          <div className="grid gap-2 border-t border-border p-4 sm:grid-cols-3">
            <SecondaryButton
              onClick={() =>
                toast(
                  "info",
                  "Code explanation",
                  "This component keeps UI state local and moves from planning into build mode through an explicit user action.",
                )
              }
            >
              <BookOpen size={15} />
              Explain
            </SecondaryButton>
            <SecondaryButton
              onClick={() =>
                toast(
                  "info",
                  "Debug check",
                  "No blocking issue is apparent in this focused example. Add runtime inputs to validate edge cases.",
                )
              }
            >
              <ShieldCheck size={15} />
              Debug
            </SecondaryButton>
            <SecondaryButton
              onClick={() =>
                toast(
                  "info",
                  "Improvement path",
                  "Consider extracting workspace state into a typed hook as this feature expands.",
                )
              }
            >
              <WandSparkles size={15} />
              Improve
            </SecondaryButton>
          </div>
        </section>
      </div>
    </>
  );
}
function WorkspacesPage() {
  usePageMeta(
    "Workspaces",
    "Organize ORION into focused spaces for product, research, and personal operating contexts.",
  );
  return (
    <>
      <PageHeader
        eyebrow="WORKSPACES"
        title="Context, deliberately separated."
        description="Workspaces are a scalable layer for keeping different teams, initiatives, and modes of thinking organized."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Product command", "Launch strategy, user feedback, and build decisions.", Rocket],
          ["Research lab", "Live research, comparisons, and evidence mapping.", Globe2],
          ["Personal operating system", "Goals, study, notes, and focused execution.", BrainCircuit],
        ].map(([title, description, Icon]) => (
          <article key={title} className="glass rounded-3xl p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon size={20} />
            </div>
            <h2 className="mt-5 text-lg font-extrabold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            <Link
              to="/projects"
              className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg text-sm font-bold text-primary"
            >
              Open projects <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
function SavedPage() {
  usePageMeta("Saved Items", "Return to useful ORION outputs, research, and project context worth keeping.");
  return (
    <>
      <PageHeader
        eyebrow="SAVED CONTEXT"
        title="Keep the work worth returning to."
        description="Save useful outputs, research, and conversation moments so the right context is always close."
      />
      <section className="glass rounded-3xl p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Star size={22} />
        </div>
        <h2 className="mt-4 text-lg font-extrabold">Your saved context will gather here</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Save important plans, research threads, and generated outputs for fast retrieval.
        </p>
        <Link
          to="/chat"
          className="focus-ring mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-primary-foreground"
        >
          <MessageSquareText size={16} />
          Start a conversation
        </Link>
      </section>
    </>
  );
}
function SettingsPage({ user, openAuth, toast }) {
  const { t, language: interfaceLanguage, setLanguage: setInterfaceLanguage } = useLanguage();
  usePageMeta(
    "Settings",
    "Manage your ORION response preferences, profile context, default language, creativity, and scalable provider settings.",
  );
  const [settings, setSettings] = useState({
    responseStyle: "Structured & direct",
    skillLevel: "Adaptive",
    language: "English",
    responseLength: "Balanced",
    creativity: 64,
  });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    const load = async () => {
      if (!user) return;
      try {
        const saved = await window.genmb.kv.get(`orion:settings:${user.id}`);
        if (live && saved && typeof saved === "object") setSettings((current) => ({ ...current, ...saved }));
      } catch (err) {
        toast("error", "Could not load preferences", err.message);
      }
    };
    void load();
    return () => {
      live = false;
    };
  }, [user, toast]);
  const save = async () => {
    if (!user) {
      openAuth();
      return;
    }
    setBusy(true);
    try {
      await window.genmb.kv.set(`orion:settings:${user.id}`, settings);
      toast("success", "Preferences saved", "Your response settings are synced to your private workspace.");
    } catch (err) {
      toast("error", "Settings could not be saved", err.message);
    } finally {
      setBusy(false);
    }
  };
  const select = (label, field, options) => (
    <div>
      <label htmlFor={field} className="mb-1.5 block text-sm font-bold">
        {label}
      </label>
      <select
        id={field}
        value={settings[field]}
        onChange={(event) => setSettings((current) => ({ ...current, [field]: event.target.value }))}
        className="focus-ring w-full rounded-xl border border-input bg-muted px-3 py-2.5 text-sm text-foreground"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
  return (
    <>
      <PageHeader
        eyebrow="SETTINGS"
        title="Make ORION feel like yours."
        description="Adjust response behavior and maintain a provider-ready foundation without putting secrets in the browser."
        action={
          <PrimaryButton onClick={() => void save()} disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}Save preferences
          </PrimaryButton>
        }
      />
      <RequireAuth user={user} openAuth={openAuth}>
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="glass rounded-3xl p-6">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
              {user?.picture ? (
                <img src={user.picture} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-extrabold">{(user?.name || "O").slice(0, 1)}</span>
              )}
            </div>
            <h2 className="mt-4 text-lg font-extrabold">{user?.name || "ORION member"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm text-muted-foreground">
              <p className="flex gap-2">
                <ShieldCheck size={16} className="text-success" />
                Session managed by GenMB Authentication
              </p>
              <p className="flex gap-2">
                <LockKeyhole size={16} className="text-primary" />
                Private records scoped by account ID
              </p>
            </div>
          </section>
          <section className="glass rounded-3xl p-6">
            <h2 className="text-lg font-extrabold">Response preferences</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {select("Response style", "responseStyle", [
                "Structured & direct",
                "Conversational",
                "Executive",
                "Teaching",
              ])}
              {select("Skill level", "skillLevel", ["Adaptive", "Beginner-friendly", "Expert"])}
              {select(t("language.ai"), "language", responseLanguages)}
              {select("Response length", "responseLength", ["Concise", "Balanced", "Detailed"])}
            </div>
            <div className="mt-5 rounded-2xl border border-border bg-background/35 p-4">
              <label htmlFor="interface-language" className="mb-1.5 block text-sm font-bold">
                {t("language.interface")}
              </label>
              <select
                id="interface-language"
                value={interfaceLanguage}
                onChange={(event) => setInterfaceLanguage(event.target.value)}
                className="focus-ring w-full rounded-xl border border-input bg-muted px-3 py-2.5 text-sm text-foreground"
              >
                {interfaceLanguages.map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{t("language.help")}</p>
            </div>
            <div className="mt-5">
              <label htmlFor="creativity" className="flex justify-between text-sm font-bold">
                <span>Creativity</span>
                <span className="font-mono text-primary">{settings.creativity}%</span>
              </label>
              <input
                id="creativity"
                type="range"
                min="0"
                max="100"
                value={settings.creativity}
                onChange={(event) => setSettings((current) => ({ ...current, creativity: Number(event.target.value) }))}
                className="mt-3 w-full accent-primary"
              />
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-background/35 p-4">
              <p className="text-xs font-extrabold tracking-[0.14em] text-primary">AI PROVIDER ARCHITECTURE</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Provider credentials belong in a secure server function. ORION is ready for provider, model, tool
                calling, context, memory, response, and output renderer modules.
              </p>
            </div>
          </section>
        </div>
      </RequireAuth>
    </>
  );
}
function NotFound() {
  usePageMeta("Page Not Found", "The ORION page you requested is unavailable.");
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <section className="glass max-w-lg rounded-3xl p-8 text-center">
        <Bot size={28} className="mx-auto text-primary" />
        <h1 className="mt-4 text-2xl font-extrabold">This orbit is uncharted.</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The workspace page you requested does not exist or has moved.
        </p>
        <Link
          to="/dashboard"
          className="focus-ring mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-primary-foreground"
        >
          <ArrowRight size={16} />
          Return to overview
        </Link>
      </section>
    </div>
  );
}
function Application({ user, openAuth, signOut, toast }) {
  return (
    <AppShell user={user} openAuth={openAuth} signOut={signOut}>
      <Routes>
        <Route path="/" element={<Landing openAuth={openAuth} />} />
        <Route path="/dashboard" element={<Dashboard user={user} openAuth={openAuth} />} />
        <Route path="/chat" element={<ChatPage user={user} openAuth={openAuth} toast={toast} />} />
        <Route path="/projects" element={<ProjectsPage user={user} openAuth={openAuth} toast={toast} />} />
        <Route path="/files" element={<FilesPage user={user} openAuth={openAuth} toast={toast} />} />
        <Route path="/workspaces" element={<WorkspacesPage />} />
        <Route path="/capabilities" element={<CapabilitiesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/create" element={<CreatePage user={user} openAuth={openAuth} toast={toast} />} />
        <Route path="/roadmap" element={<RoadmapPage user={user} openAuth={openAuth} toast={toast} />} />
        <Route path="/workflows" element={<WorkflowsPage user={user} openAuth={openAuth} toast={toast} />} />
        <Route path="/research" element={<ResearchPage user={user} toast={toast} />} />
        <Route path="/code" element={<CodePage toast={toast} />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/settings" element={<SettingsPage user={user} openAuth={openAuth} toast={toast} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
export default function App() {
  const { user, loading } = useAuth();
  const [auth, setAuth] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((type, title, description) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, type, title, description }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 5200);
  }, []);
  const openAuth = useCallback((mode = "signin") => setAuth(mode), []);
  const signOut = async () => {
    try {
      await window.genmb.auth.signOut();
      toast("success", "Signed out", "Your session has ended on this device.");
    } catch (err) {
      toast("error", "Sign-out failed", err.message);
    }
  };
  if (loading)
    return (
      <div className="min-h-screen">
        <div className="orion-atmosphere">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="orb orb-three" />
        </div>
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <OrionMark />
          <div className="mt-8 h-2 w-44 overflow-hidden rounded-full bg-muted">
            <div className="shimmer h-full w-full" />
          </div>
          <p className="mt-4 text-sm font-bold text-muted-foreground">Preparing your intelligence workspace</p>
        </div>
      </div>
    );
  return (
    <HashRouter>
      <div className="orion-atmosphere">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="orb orb-three" />
        <div className="light-streak" />
        <div className="light-streak" />
      </div>
      <Application user={user} openAuth={openAuth} signOut={() => void signOut()} toast={toast} />
      {auth && (
        <AuthModal
          initialMode={auth}
          onClose={() => setAuth(null)}
          onSuccess={(message) => toast("success", message)}
        />
      )}
      <Toasts toasts={toasts} dismiss={(id) => setToasts((current) => current.filter((item) => item.id !== id))} />
    </HashRouter>
  );
}
