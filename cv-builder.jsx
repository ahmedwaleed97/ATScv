import React, { useState, useMemo, useRef, useCallback } from "react";
import mammoth from "mammoth";
import {
  Plus, Trash2, ChevronUp, ChevronDown, ChevronRight, Eye, Pencil,
  Sparkles, Download, ArrowLeft, X, Check, Upload, Link as LinkIcon,
  Mail, Phone, MapPin, Globe, Github, Linkedin, Briefcase, GraduationCap,
  Award, Languages, Heart, FolderGit2, BadgeCheck, Layers, FileText,
  Zap, ShieldCheck, Smartphone, Star, AlertTriangle, TrendingUp, FileCheck2, FileUp,
} from "lucide-react";

/* =============================================================================
   CV Builder — single-file app.
   Architecture notes (kept deliberately simple to scale later):
   - All CV content lives in one `cv` state object (see emptyCV()).
   - Repeater sections share <Repeater/> so adding a new list section is ~10 lines.
   - The CV document <CVSheet/> is a pure render of `cv`; it's mounted twice:
       (1) on-screen preview  (2) an off-screen print source for clean PDF export.
   - AI: analyzeLocally() runs now (no key needed). runAIAnalysis() is the hook
     to swap in a real LLM call later — UI already consumes its shape.
   ========================================================================== */

const uid = () => Math.random().toString(36).slice(2, 9);

const emptyCV = () => ({
  fullName: "", title: "", photo: "",
  email: "", phone: "", location: "",
  website: "", linkedin: "", github: "", portfolio: "",
  customLinks: [],
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  volunteer: [],
  customSections: [],
});

/* A generic sample so the preview isn't empty on first load. Fictional person. */
const sampleCV = () => ({
  ...emptyCV(),
  fullName: "Jordan Reyes",
  title: "Full-Stack Developer",
  email: "jordan.reyes@example.com",
  phone: "+1 (555) 014-2387",
  location: "Austin, TX",
  website: "jordanreyes.dev",
  github: "github.com/jordanreyes",
  linkedin: "linkedin.com/in/jordanreyes",
  summary:
    "Full-stack developer with 4 years building web applications end to end. Comfortable across React, Node.js, and cloud deployment, with a focus on clean APIs and fast, accessible interfaces.",
  skills: ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS", "REST APIs", "Git", "CI/CD"],
  experience: [
    {
      id: uid(), company: "Brightlane Software", position: "Full-Stack Developer",
      start: "Jan 2023", end: "Present", current: true,
      description: "Build and maintain customer-facing web apps for a SaaS analytics platform.",
      achievements: "Cut page load time 35% by refactoring the React render path.\nShipped a billing dashboard used by 8,000+ monthly active users.\nMentored 2 junior developers through onboarding.",
    },
    {
      id: uid(), company: "Northwind Labs", position: "Junior Web Developer",
      start: "Jun 2021", end: "Dec 2022", current: false,
      description: "Worked on internal tools and client websites.",
      achievements: "Automated a manual reporting task, saving ~6 hours per week.\nBuilt a reusable component library adopted across 4 projects.",
    },
  ],
  education: [
    {
      id: uid(), institution: "University of Texas at Austin", degree: "B.Sc.",
      field: "Computer Science", start: "2017", end: "2021", description: "",
    },
  ],
  projects: [
    {
      id: uid(), name: "OpenRecipe", description: "Open-source recipe manager with offline support.",
      technologies: "React, Node.js, PostgreSQL", github: "github.com/jordanreyes/openrecipe", demo: "openrecipe.app",
    },
  ],
  certifications: [
    { id: uid(), name: "AWS Certified Developer – Associate", org: "Amazon Web Services", date: "2023", url: "" },
  ],
  languages: [
    { id: uid(), name: "English", level: "Native" },
    { id: uid(), name: "Spanish", level: "Conversational" },
  ],
});

export default function App() {
  const [view, setView] = useState("home"); // "home" | "builder"
  const [cv, setCV] = useState(sampleCV);

  return (
    <div className="cvb-root">
      <StyleSheet />
      {view === "home" && <Home onStart={() => setView("builder")} onCheck={() => setView("checker")} />}
      {view === "builder" && <Builder cv={cv} setCV={setCV} onHome={() => setView("home")} />}
      {view === "checker" && <Checker onHome={() => setView("home")} onBuild={() => setView("builder")} />}
      {/* Always-mounted off-screen source used only for printing → clean PDF. */}
      <div className="print-source" aria-hidden="true">
        <CVSheet cv={cv} />
      </div>
    </div>
  );
}

/* ============================== LOGO ==================================== */
function Logo({ size = "md" }) {
  return (
    <span className={`logo logo-${size}`} aria-label="ATScv">
      <span className="logo-mark"><Check size={size === "md" ? 15 : 13} strokeWidth={3.2} /></span>
      <span className="logo-word">ATS<span className="logo-cv">cv</span></span>
    </span>
  );
}

/* ============================== HOME ===================================== */

function Home({ onStart, onCheck }) {
  const features = [
    { icon: <Sparkles size={20} />, title: "AI resume review", body: "Get a score, ATS check, weak-spot flags, and sharper wording — instantly." },
    { icon: <Eye size={20} />, title: "Live preview", body: "Watch a clean, professional CV build itself as you type. No guessing." },
    { icon: <Download size={20} />, title: "Print-perfect PDF", body: "Export crisp typography and clickable links, single or multi-page." },
    { icon: <Smartphone size={20} />, title: "Built for your phone", body: "Every field, the preview, and export work one-handed on mobile." },
    { icon: <Layers size={20} />, title: "Every section", body: "Experience, projects, skills, certs, languages, awards — plus custom ones." },
    { icon: <ShieldCheck size={20} />, title: "Stays with you", body: "Everything runs in your browser. Nothing is uploaded anywhere." },
  ];
  return (
    <div className="home">
      <header className="home-nav no-print">
        <Logo size="md" />
        <button className="btn btn-sm btn-primary" onClick={onStart}>Create CV</button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Free CV builder</span>
          <h1 className="hero-title">Build your CV</h1>
          <p className="hero-sub">
            Fill in your details, see them laid out as a clean CV, and download it
            as a PDF. An AI check points out gaps and weak spots before you send it.
          </p>
          <div className="hero-actions">
            <div className="hero-btn-row">
              <button className="btn btn-primary btn-lg" onClick={onStart}>
                Create CV <ArrowLeft size={18} style={{ transform: "rotate(180deg)" }} />
              </button>
              <button className="btn btn-ghost btn-lg" onClick={onCheck}>
                <FileCheck2 size={17} /> Check an existing CV
              </button>
            </div>
            <span className="hero-note">Free · no sign-up · runs in your browser</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-sheet hero-sheet-back" />
          <div className="hero-sheet hero-sheet-front">
            <MiniSheet />
          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-h">What it does</h2>
        <div className="feature-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="showcase">
        <div className="showcase-inner">
          <div className="showcase-text">
            <span className="eyebrow eyebrow-light">AI review</span>
            <h2>Check your CV before you send it</h2>
            <p>
              Tap once to score your CV out of 100. It flags what's missing, weak
              wording, and keywords for the role, then re-scores after you fix things.
            </p>
            <ul className="check-list">
              <li><Check size={16}/> ATS-friendliness check</li>
              <li><Check size={16}/> Stronger achievement phrasing</li>
              <li><Check size={16}/> Missing-section + keyword flags</li>
            </ul>
          </div>
          <div className="showcase-score">
            <ScoreRing value={82} size={150} />
            <span className="showcase-score-label">Sample score</span>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to start?</h2>
        <button className="btn btn-primary btn-lg" onClick={onStart}>Create CV</button>
      </section>

      <footer className="home-foot">Built for fast, honest CVs.</footer>
    </div>
  );
}

function MiniSheet() {
  return (
    <div className="mini-sheet">
      <div className="mini-head">
        <div className="mini-avatar" />
        <div>
          <div className="mini-name" />
          <div className="mini-role" />
        </div>
      </div>
      <div className="mini-line w90" />
      <div className="mini-line w70" />
      <div className="mini-sec" />
      <div className="mini-line w80" />
      <div className="mini-line w60" />
      <div className="mini-sec" />
      <div className="mini-tags">
        {[40, 56, 32, 48, 38].map((w, i) => <span key={i} style={{ width: w }} />)}
      </div>
    </div>
  );
}

/* ============================== BUILDER ================================== */

const TABS = [
  { id: "edit", label: "Edit", icon: <Pencil size={16} /> },
  { id: "preview", label: "Preview", icon: <Eye size={16} /> },
  { id: "review", label: "AI Review", icon: <Sparkles size={16} /> },
];

function Builder({ cv, setCV, onHome }) {
  const [tab, setTab] = useState("edit"); // mobile tab; desktop shows edit+preview together

  // generic field updater
  const set = useCallback((key, value) => setCV((c) => ({ ...c, [key]: value })), [setCV]);

  return (
    <div className="builder">
      <header className="topbar no-print">
        <button className="icon-btn" onClick={onHome} aria-label="Back to home"><ArrowLeft size={20} /></button>
        <Logo size="sm" />
        <button className="btn btn-sm btn-primary" onClick={() => exportCV(cv.fullName)}>
          <Download size={16} /> PDF
        </button>
      </header>

      {/* mobile tab switcher */}
      <nav className="tabbar no-print" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab ${tab === t.id ? "tab-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon}<span>{t.label}</span>
          </button>
        ))}
      </nav>

      <div className="builder-body">
        {/* FORM PANE */}
        <div className={`pane form-pane ${tab === "edit" ? "" : "pane-hide-mobile"}`}>
          <FormColumn cv={cv} setCV={setCV} set={set} />
        </div>

        {/* PREVIEW PANE */}
        <div className={`pane preview-pane ${tab === "preview" ? "" : "pane-hide-mobile"}`}>
          <div className="preview-scroll">
            <CVSheet cv={cv} />
          </div>
        </div>

        {/* AI PANE (mobile tab only; on desktop it's a slide-in via button) */}
        <div className={`pane review-pane ${tab === "review" ? "" : "pane-hide-mobile"} review-mobile`}>
          <AIPanel cv={cv} />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- FORM ------------------------------------- */

function FormColumn({ cv, setCV, set }) {
  const photoInput = useRef(null);

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("photo", reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="form-col">
      <DesktopReviewLauncher cv={cv} />

      <Accordion title="Basics" icon={<FileText size={18} />} defaultOpen>
        <div className="photo-row">
          <div className="photo-prev" style={cv.photo ? { backgroundImage: `url(${cv.photo})` } : undefined}>
            {!cv.photo && <span>Photo</span>}
          </div>
          <div className="photo-actions">
            <input ref={photoInput} type="file" accept="image/*" hidden onChange={onPhoto} />
            <button className="btn btn-ghost btn-sm" onClick={() => photoInput.current?.click()}>
              <Upload size={15} /> {cv.photo ? "Replace" : "Add photo"}
            </button>
            {cv.photo && (
              <button className="btn btn-ghost btn-sm danger" onClick={() => set("photo", "")}>
                <X size={15} /> Remove
              </button>
            )}
          </div>
        </div>
        <Field label="Full name" value={cv.fullName} onChange={(v) => set("fullName", v)} placeholder="Jordan Reyes" />
        <Field label="Professional title" value={cv.title} onChange={(v) => set("title", v)} placeholder="DevOps & Backend Engineer" />
        <div className="grid-2">
          <Field label="Email" value={cv.email} onChange={(v) => set("email", v)} placeholder="you@email.com" />
          <Field label="Phone" value={cv.phone} onChange={(v) => set("phone", v)} placeholder="+1 (555) …" />
        </div>
        <Field label="Location" value={cv.location} onChange={(v) => set("location", v)} placeholder="Austin, TX" />
      </Accordion>

      <Accordion title="Links" icon={<LinkIcon size={18} />}>
        <div className="grid-2">
          <Field label="Website" value={cv.website} onChange={(v) => set("website", v)} placeholder="yoursite.com" />
          <Field label="Portfolio" value={cv.portfolio} onChange={(v) => set("portfolio", v)} placeholder="portfolio link" />
        </div>
        <div className="grid-2">
          <Field label="LinkedIn" value={cv.linkedin} onChange={(v) => set("linkedin", v)} placeholder="linkedin.com/in/…" />
          <Field label="GitHub" value={cv.github} onChange={(v) => set("github", v)} placeholder="github.com/…" />
        </div>
        <Repeater
          items={cv.customLinks}
          onChange={(items) => set("customLinks", items)}
          blank={() => ({ id: uid(), label: "", url: "" })}
          addLabel="Add link"
          render={(item, upd) => (
            <div className="grid-2">
              <Field label="Label" value={item.label} onChange={(v) => upd({ label: v })} placeholder="Twitter / Behance" />
              <Field label="URL" value={item.url} onChange={(v) => upd({ url: v })} placeholder="https://…" />
            </div>
          )}
        />
      </Accordion>

      <Accordion title="Professional summary" icon={<FileText size={18} />}>
        <TextArea value={cv.summary} onChange={(v) => set("summary", v)} rows={4}
          placeholder="Two or three lines on who you are and what you're moving toward." />
      </Accordion>

      <Accordion title="Experience" icon={<Briefcase size={18} />}>
        <Repeater
          items={cv.experience}
          onChange={(items) => set("experience", items)}
          blank={() => ({ id: uid(), company: "", position: "", start: "", end: "", current: false, description: "", achievements: "" })}
          addLabel="Add experience"
          titleOf={(it) => it.position || it.company || "New role"}
          render={(item, upd) => (
            <>
              <div className="grid-2">
                <Field label="Company" value={item.company} onChange={(v) => upd({ company: v })} />
                <Field label="Position" value={item.position} onChange={(v) => upd({ position: v })} />
              </div>
              <div className="grid-2">
                <Field label="Start" value={item.start} onChange={(v) => upd({ start: v })} placeholder="Jan 2024" />
                <Field label="End" value={item.end} onChange={(v) => upd({ end: v })} placeholder="Present" disabled={item.current} />
              </div>
              <Toggle label="I currently work here" checked={item.current} onChange={(v) => upd({ current: v, end: v ? "Present" : "" })} />
              <TextArea label="Description" value={item.description} onChange={(v) => upd({ description: v })} rows={2} />
              <TextArea label="Achievements (one per line)" value={item.achievements} onChange={(v) => upd({ achievements: v })} rows={3}
                placeholder="Cut deploy time 40% by…&#10;Automated provisioning across 20 hosts…" />
            </>
          )}
        />
      </Accordion>

      <Accordion title="Education" icon={<GraduationCap size={18} />}>
        <Repeater
          items={cv.education}
          onChange={(items) => set("education", items)}
          blank={() => ({ id: uid(), institution: "", degree: "", field: "", start: "", end: "", description: "" })}
          addLabel="Add education"
          titleOf={(it) => it.institution || it.degree || "New entry"}
          render={(item, upd) => (
            <>
              <Field label="Institution" value={item.institution} onChange={(v) => upd({ institution: v })} />
              <div className="grid-2">
                <Field label="Degree" value={item.degree} onChange={(v) => upd({ degree: v })} placeholder="B.Sc." />
                <Field label="Field of study" value={item.field} onChange={(v) => upd({ field: v })} />
              </div>
              <div className="grid-2">
                <Field label="Start" value={item.start} onChange={(v) => upd({ start: v })} />
                <Field label="End" value={item.end} onChange={(v) => upd({ end: v })} />
              </div>
              <TextArea label="Description" value={item.description} onChange={(v) => upd({ description: v })} rows={2} />
            </>
          )}
        />
      </Accordion>

      <Accordion title="Skills" icon={<Zap size={18} />}>
        <TagInput tags={cv.skills} onChange={(t) => set("skills", t)} placeholder="Type a skill, press Enter" />
      </Accordion>

      <Accordion title="Projects" icon={<FolderGit2 size={18} />}>
        <Repeater
          items={cv.projects}
          onChange={(items) => set("projects", items)}
          blank={() => ({ id: uid(), name: "", description: "", technologies: "", github: "", demo: "" })}
          addLabel="Add project"
          titleOf={(it) => it.name || "New project"}
          render={(item, upd) => (
            <>
              <Field label="Name" value={item.name} onChange={(v) => upd({ name: v })} />
              <TextArea label="Description" value={item.description} onChange={(v) => upd({ description: v })} rows={2} />
              <Field label="Technologies" value={item.technologies} onChange={(v) => upd({ technologies: v })} placeholder="FastAPI, Docker, …" />
              <div className="grid-2">
                <Field label="GitHub" value={item.github} onChange={(v) => upd({ github: v })} />
                <Field label="Live demo" value={item.demo} onChange={(v) => upd({ demo: v })} />
              </div>
            </>
          )}
        />
      </Accordion>

      <Accordion title="Certifications" icon={<BadgeCheck size={18} />}>
        <Repeater
          items={cv.certifications}
          onChange={(items) => set("certifications", items)}
          blank={() => ({ id: uid(), name: "", org: "", date: "", url: "" })}
          addLabel="Add certification"
          titleOf={(it) => it.name || "New certification"}
          render={(item, upd) => (
            <>
              <div className="grid-2">
                <Field label="Name" value={item.name} onChange={(v) => upd({ name: v })} placeholder="RHCSA" />
                <Field label="Organization" value={item.org} onChange={(v) => upd({ org: v })} placeholder="Red Hat" />
              </div>
              <div className="grid-2">
                <Field label="Date" value={item.date} onChange={(v) => upd({ date: v })} />
                <Field label="Credential URL" value={item.url} onChange={(v) => upd({ url: v })} />
              </div>
            </>
          )}
        />
      </Accordion>

      <Accordion title="Languages" icon={<Languages size={18} />}>
        <Repeater
          items={cv.languages}
          onChange={(items) => set("languages", items)}
          blank={() => ({ id: uid(), name: "", level: "" })}
          addLabel="Add language"
          titleOf={(it) => it.name || "New language"}
          render={(item, upd) => (
            <div className="grid-2">
              <Field label="Language" value={item.name} onChange={(v) => upd({ name: v })} placeholder="Arabic" />
              <Field label="Level" value={item.level} onChange={(v) => upd({ level: v })} placeholder="Native / Fluent" />
            </div>
          )}
        />
      </Accordion>

      <Accordion title="Awards" icon={<Award size={18} />}>
        <Repeater
          items={cv.awards}
          onChange={(items) => set("awards", items)}
          blank={() => ({ id: uid(), name: "", issuer: "", date: "" })}
          addLabel="Add award"
          titleOf={(it) => it.name || "New award"}
          render={(item, upd) => (
            <>
              <Field label="Award" value={item.name} onChange={(v) => upd({ name: v })} />
              <div className="grid-2">
                <Field label="Issuer" value={item.issuer} onChange={(v) => upd({ issuer: v })} />
                <Field label="Date" value={item.date} onChange={(v) => upd({ date: v })} />
              </div>
            </>
          )}
        />
      </Accordion>

      <Accordion title="Volunteer experience" icon={<Heart size={18} />}>
        <Repeater
          items={cv.volunteer}
          onChange={(items) => set("volunteer", items)}
          blank={() => ({ id: uid(), org: "", role: "", date: "", description: "" })}
          addLabel="Add volunteer role"
          titleOf={(it) => it.role || it.org || "New role"}
          render={(item, upd) => (
            <>
              <div className="grid-2">
                <Field label="Organization" value={item.org} onChange={(v) => upd({ org: v })} />
                <Field label="Role" value={item.role} onChange={(v) => upd({ role: v })} />
              </div>
              <Field label="Date" value={item.date} onChange={(v) => upd({ date: v })} />
              <TextArea label="Description" value={item.description} onChange={(v) => upd({ description: v })} rows={2} />
            </>
          )}
        />
      </Accordion>

      <Accordion title="Custom sections" icon={<Layers size={18} />}>
        <Repeater
          items={cv.customSections}
          onChange={(items) => set("customSections", items)}
          blank={() => ({ id: uid(), title: "", content: "" })}
          addLabel="Add section"
          titleOf={(it) => it.title || "New section"}
          render={(item, upd) => (
            <>
              <Field label="Section title" value={item.title} onChange={(v) => upd({ title: v })} placeholder="Publications" />
              <TextArea label="Content (one item per line)" value={item.content} onChange={(v) => upd({ content: v })} rows={3} />
            </>
          )}
        />
      </Accordion>

      <div className="form-foot no-print">
        <button className="btn btn-primary btn-block" onClick={() => exportCV(cv.fullName)}>
          <Download size={16} /> Download PDF
        </button>
      </div>
    </div>
  );
}

/* On desktop, show the AI review as a launch button at the top of the form
   that opens a slide-over. On mobile, the third tab is used instead. */
function DesktopReviewLauncher({ cv }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="desktop-review no-print">
      <button className="btn btn-accent btn-block" onClick={() => setOpen(true)}>
        <Sparkles size={16} /> Run AI review
      </button>
      {open && (
        <div className="slideover-backdrop" onClick={() => setOpen(false)}>
          <div className="slideover" onClick={(e) => e.stopPropagation()}>
            <div className="slideover-head">
              <span><Sparkles size={16} /> AI Review</span>
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close"><X size={20} /></button>
            </div>
            <div className="slideover-body"><AIPanel cv={cv} /></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------- FORM PRIMITIVES ------------------------------- */

function Field({ label, value, onChange, placeholder, disabled }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <input
        className="input"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <textarea
        className="input textarea"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button type="button" className="toggle" onClick={() => onChange(!checked)} aria-pressed={checked}>
      <span className={`toggle-track ${checked ? "on" : ""}`}><span className="toggle-knob" /></span>
      <span className="toggle-label">{label}</span>
    </button>
  );
}

function TagInput({ tags, onChange, placeholder }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setDraft("");
  };
  return (
    <div>
      <div className="taglist">
        {tags.map((t) => (
          <span className="tag" key={t}>
            {t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}><X size={13} /></button>
          </span>
        ))}
        {tags.length === 0 && <span className="tag-empty">No skills yet</span>}
      </div>
      <div className="tag-add">
        <input
          className="input"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <button className="btn btn-ghost btn-sm" onClick={add}><Plus size={15} /></button>
      </div>
    </div>
  );
}

function Accordion({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`acc ${open ? "acc-open" : ""}`}>
      <button className="acc-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="acc-title">{icon}{title}</span>
        <ChevronRight size={18} className="acc-chev" />
      </button>
      {open && <div className="acc-body">{children}</div>}
    </div>
  );
}

/* Reusable list section: add / edit / delete / reorder. */
function Repeater({ items, onChange, blank, render, addLabel, titleOf }) {
  const add = () => onChange([...items, blank()]);
  const remove = (id) => onChange(items.filter((it) => it.id !== id));
  const update = (id, patch) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const move = (idx, dir) => {
    const next = idx + dir;
    if (next < 0 || next >= items.length) return;
    const copy = [...items];
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    onChange(copy);
  };
  return (
    <div className="repeater">
      {items.map((item, idx) => (
        <RepeaterItem
          key={item.id}
          title={titleOf ? titleOf(item) : null}
          canUp={idx > 0}
          canDown={idx < items.length - 1}
          onUp={() => move(idx, -1)}
          onDown={() => move(idx, 1)}
          onRemove={() => remove(item.id)}
        >
          {render(item, (patch) => update(item.id, patch))}
        </RepeaterItem>
      ))}
      <button className="btn btn-dashed btn-block" onClick={add}><Plus size={15} /> {addLabel}</button>
    </div>
  );
}

function RepeaterItem({ title, children, canUp, canDown, onUp, onDown, onRemove }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rep-item">
      <div className="rep-head">
        <button className="rep-toggle" onClick={() => setOpen((o) => !o)}>
          <ChevronRight size={15} className={`rep-chev ${open ? "open" : ""}`} />
          {title && <span className="rep-title">{title}</span>}
        </button>
        <div className="rep-tools">
          <button className="icon-btn xs" disabled={!canUp} onClick={onUp} aria-label="Move up"><ChevronUp size={15} /></button>
          <button className="icon-btn xs" disabled={!canDown} onClick={onDown} aria-label="Move down"><ChevronDown size={15} /></button>
          <button className="icon-btn xs danger" onClick={onRemove} aria-label="Delete"><Trash2 size={15} /></button>
        </div>
      </div>
      {open && <div className="rep-body">{children}</div>}
    </div>
  );
}

/* ============================== CV SHEET ================================= */
/* Pure render of `cv`. Used for both on-screen preview and print source. */

function CVSheet({ cv }) {
  const hasContact = cv.email || cv.phone || cv.location;
  const links = [
    cv.website && { icon: <Globe size={12} />, label: cv.website, url: cv.website },
    cv.linkedin && { icon: <Linkedin size={12} />, label: cv.linkedin, url: cv.linkedin },
    cv.github && { icon: <Github size={12} />, label: cv.github, url: cv.github },
    cv.portfolio && { icon: <LinkIcon size={12} />, label: cv.portfolio, url: cv.portfolio },
    ...cv.customLinks.filter((l) => l.url || l.label).map((l) => ({ icon: <LinkIcon size={12} />, label: l.label || l.url, url: l.url })),
  ].filter(Boolean);

  const empty = !cv.fullName && !cv.title && !cv.summary && cv.experience.length === 0;

  return (
    <article className="cv-sheet">
      <header className="cv-header">
        {cv.photo && <div className="cv-photo" style={{ backgroundImage: `url(${cv.photo})` }} />}
        <div className="cv-headtext">
          <h1 className="cv-name">{cv.fullName || "Your Name"}</h1>
          {cv.title && <p className="cv-role">{cv.title}</p>}
          {hasContact && (
            <div className="cv-contact">
              {cv.email && <span><Mail size={12} /> {cv.email}</span>}
              {cv.phone && <span><Phone size={12} /> {cv.phone}</span>}
              {cv.location && <span><MapPin size={12} /> {cv.location}</span>}
            </div>
          )}
          {links.length > 0 && (
            <div className="cv-links">
              {links.map((l, i) => (
                <a key={i} href={prefixUrl(l.url)} target="_blank" rel="noreferrer">{l.icon}{l.label}</a>
              ))}
            </div>
          )}
        </div>
      </header>

      {empty && <p className="cv-empty">Start filling the form — your CV appears here as you type.</p>}

      {cv.summary && (
        <Section title="Summary">
          <p className="cv-summary">{cv.summary}</p>
        </Section>
      )}

      {cv.experience.length > 0 && (
        <Section title="Experience">
          {cv.experience.map((e) => (
            <div className="cv-entry" key={e.id}>
              <div className="cv-entry-top">
                <span className="cv-entry-title">{e.position}{e.company && <span className="cv-at"> · {e.company}</span>}</span>
                <span className="cv-date">{[e.start, e.current ? "Present" : e.end].filter(Boolean).join(" – ")}</span>
              </div>
              {e.description && <p className="cv-entry-desc">{e.description}</p>}
              {e.achievements && (
                <ul className="cv-bullets">
                  {lines(e.achievements).map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {cv.projects.length > 0 && (
        <Section title="Projects">
          {cv.projects.map((p) => (
            <div className="cv-entry" key={p.id}>
              <div className="cv-entry-top">
                <span className="cv-entry-title">{p.name}</span>
                <span className="cv-date cv-proj-links">
                  {p.github && <a href={prefixUrl(p.github)} target="_blank" rel="noreferrer">GitHub</a>}
                  {p.demo && <a href={prefixUrl(p.demo)} target="_blank" rel="noreferrer">Demo</a>}
                </span>
              </div>
              {p.description && <p className="cv-entry-desc">{p.description}</p>}
              {p.technologies && <p className="cv-tech">{p.technologies}</p>}
            </div>
          ))}
        </Section>
      )}

      {cv.skills.length > 0 && (
        <Section title="Skills">
          <div className="cv-skills">{cv.skills.map((s) => <span key={s}>{s}</span>)}</div>
        </Section>
      )}

      {cv.education.length > 0 && (
        <Section title="Education">
          {cv.education.map((e) => (
            <div className="cv-entry" key={e.id}>
              <div className="cv-entry-top">
                <span className="cv-entry-title">{[e.degree, e.field].filter(Boolean).join(", ")}<span className="cv-at"> · {e.institution}</span></span>
                <span className="cv-date">{[e.start, e.end].filter(Boolean).join(" – ")}</span>
              </div>
              {e.description && <p className="cv-entry-desc">{e.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {cv.certifications.length > 0 && (
        <Section title="Certifications">
          {cv.certifications.map((c) => (
            <div className="cv-row" key={c.id}>
              <span className="cv-entry-title">
                {c.url ? <a href={prefixUrl(c.url)} target="_blank" rel="noreferrer">{c.name}</a> : c.name}
                {c.org && <span className="cv-at"> · {c.org}</span>}
              </span>
              <span className="cv-date">{c.date}</span>
            </div>
          ))}
        </Section>
      )}

      {cv.languages.length > 0 && (
        <Section title="Languages">
          <div className="cv-langs">
            {cv.languages.map((l) => <span key={l.id}><b>{l.name}</b>{l.level && ` — ${l.level}`}</span>)}
          </div>
        </Section>
      )}

      {cv.awards.length > 0 && (
        <Section title="Awards">
          {cv.awards.map((a) => (
            <div className="cv-row" key={a.id}>
              <span className="cv-entry-title">{a.name}{a.issuer && <span className="cv-at"> · {a.issuer}</span>}</span>
              <span className="cv-date">{a.date}</span>
            </div>
          ))}
        </Section>
      )}

      {cv.volunteer.length > 0 && (
        <Section title="Volunteer">
          {cv.volunteer.map((v) => (
            <div className="cv-entry" key={v.id}>
              <div className="cv-entry-top">
                <span className="cv-entry-title">{v.role}{v.org && <span className="cv-at"> · {v.org}</span>}</span>
                <span className="cv-date">{v.date}</span>
              </div>
              {v.description && <p className="cv-entry-desc">{v.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {cv.customSections.map((s) => (
        (s.title || s.content) && (
          <Section title={s.title || "Section"} key={s.id}>
            <ul className="cv-bullets">{lines(s.content).map((c, i) => <li key={i}>{c}</li>)}</ul>
          </Section>
        )
      ))}
    </article>
  );
}

function Section({ title, children }) {
  return (
    <section className="cv-section">
      <h2 className="cv-section-title">{title}</h2>
      {children}
    </section>
  );
}

/* ============================== AI PANEL ================================= */

/* Runtime API-key input. Writes to the in-memory GEMINI holder only —
   not saved, not in source. Clears the moment you reload. */
function KeyField() {
  const [val, setVal] = useState(GEMINI.key);
  const [show, setShow] = useState(false);
  return (
    <div className="keyfield">
      <button className="keyfield-toggle" onClick={() => setShow((s) => !s)}>
        {GEMINI.key ? "✓ Gemini connected" : "Use Gemini (paste your key)"} <ChevronRight size={14} className={show ? "open" : ""} />
      </button>
      {show && (
        <div className="keyfield-body">
          <input
            className="input"
            type="password"
            placeholder="Gemini API key (kept in memory only)"
            value={val}
            onChange={(e) => { setVal(e.target.value); GEMINI.key = e.target.value.trim(); }}
          />
          <p className="keyfield-note">For local testing. The key never leaves this tab or gets saved — refresh and it's gone. Leave blank to use the offline analyzer.</p>
        </div>
      )}
    </div>
  );
}

function AIPanel({ cv }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const run = async () => {
    setLoading(true);
    setErr("");
    try {
      if (GEMINI.key) {
        const r = await geminiReview(cvToText(cv));
        setResult(r);
      } else {
        await new Promise((res) => setTimeout(res, 500));
        setResult({ ...analyzeLocally(cv), source: "local" });
      }
    } catch (e) {
      setErr(shortErr(e));
      setResult({ ...analyzeLocally(cv), source: "local" });
    }
    setLoading(false);
  };

  return (
    <div className="ai-panel">
      {!result && !loading && (
        <div className="ai-intro">
          <div className="ai-spark"><Sparkles size={22} /></div>
          <h3>Review your CV</h3>
          <p>Get a score and concrete fixes — missing info, weak wording, ATS keywords, and more.</p>
          <KeyField />
          <button className="btn btn-accent btn-block" onClick={run}><Sparkles size={16} /> Analyze CV</button>
        </div>
      )}

      {loading && (
        <div className="ai-loading">
          <div className="spinner" />
          <p>Reading your CV…</p>
        </div>
      )}

      {result && !loading && <ReviewResult result={result} onRerun={run} err={err} />}
    </div>
  );
}

/* Shared result view used by the builder AI panel and the CV checker. */
function ReviewResult({ result, onRerun, err }) {
  const fromGemini = result.source === "gemini";
  return (
    <div className="ai-result">
      {err && (
        <div className="ai-errbox">
          <AlertTriangle size={15} />
          <div>
            <b>Gemini call failed — showing the offline analyzer instead.</b>
            <span>{err}</span>
          </div>
        </div>
      )}

      <div className={`ai-srcbadge ${fromGemini ? "src-gemini" : "src-local"}`}>
        {fromGemini ? "Reviewed by Gemini" : "Offline analyzer (rules-based)"}
      </div>

      <div className="ai-score-card">
        <ScoreRing value={result.score} size={120} />
        <div className="ai-score-meta">
          <span className="ai-grade">{result.grade}</span>
          <p>{result.summary}</p>
          {onRerun && <button className="btn btn-ghost btn-sm" onClick={onRerun}>Re-run</button>}
        </div>
      </div>

      <Meter label="ATS friendliness" value={result.ats} />

      {result.strengths.length > 0 && (
        <FeedbackBlock kind="good" icon={<Star size={15} />} title="Strengths" items={result.strengths} />
      )}
      {result.missing.length > 0 && (
        <FeedbackBlock kind="warn" icon={<AlertTriangle size={15} />} title="Missing / weak" items={result.missing} />
      )}
      {result.suggestions.length > 0 && (
        <FeedbackBlock kind="tip" icon={<TrendingUp size={15} />} title="Suggestions" items={result.suggestions} />
      )}
      {result.keywords.length > 0 && (
        <div className="kw-block">
          <h4>Keywords to consider</h4>
          <div className="kw-list">{result.keywords.map((k) => <span key={k}>{k}</span>)}</div>
        </div>
      )}
    </div>
  );
}

function FeedbackBlock({ kind, icon, title, items }) {
  return (
    <div className={`fb fb-${kind}`}>
      <h4>{icon} {title}</h4>
      <ul>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}

function Meter({ label, value }) {
  return (
    <div className="meter">
      <div className="meter-top"><span>{label}</span><span>{value}%</span></div>
      <div className="meter-track"><div className="meter-fill" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function ScoreRing({ value, size = 120 }) {
  const stroke = size * 0.09;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--hair)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="ring-prog"
        />
      </svg>
      <div className="ring-num"><b>{value}</b><span>/100</span></div>
    </div>
  );
}

/* Lazy-load pdf.js from CDN so we can extract text from uploaded PDFs in-browser. */
let _pdfjs = null;
function loadPdfJs() {
  if (_pdfjs) return Promise.resolve(_pdfjs);
  if (typeof window !== "undefined" && window.pdfjsLib) { _pdfjs = window.pdfjsLib; return Promise.resolve(_pdfjs); }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload = () => {
      const lib = window.pdfjsLib;
      if (!lib) return reject(new Error("pdf reader unavailable"));
      lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      _pdfjs = lib;
      resolve(lib);
    };
    s.onerror = () => reject(new Error("could not load pdf reader"));
    document.head.appendChild(s);
  });
}

async function extractPdfText(file) {
  const lib = await loadPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: buf }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    out += tc.items.map((it) => it.str).join(" ") + "\n";
  }
  return out;
}

/* ============================== CHECKER ================================= */
/* Upload or paste an existing CV and score it against CV standards. */
function Checker({ onHome, onBuild }) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  const [apiErr, setApiErr] = useState("");
  const fileInput = useRef(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setResult(null);
    setFileName(file.name);
    const ext = file.name.split(".").pop().toLowerCase();
    try {
      if (ext === "txt") {
        setText(await file.text());
      } else if (ext === "docx") {
        const buf = await file.arrayBuffer();
        const out = await mammoth.extractRawText({ arrayBuffer: buf });
        setText(out.value || "");
      } else if (ext === "pdf") {
        setReading(true);
        const t = await extractPdfText(file);
        setReading(false);
        if (!t.trim()) {
          setError("This PDF has no selectable text — it's likely a scan/image. Paste the text instead.");
          setFileName("");
        } else {
          setText(t);
        }
      } else if (ext === "doc") {
        setError("Old .doc format isn't supported — save it as .docx or .pdf, or paste the text.");
        setFileName("");
      } else {
        setError("Unsupported file. Use .pdf, .docx, or .txt, or paste the text below.");
        setFileName("");
      }
    } catch {
      setReading(false);
      setError("Couldn't read that file. Try a different format or paste the text instead.");
      setFileName("");
    }
  };

  const analyze = async () => {
    if (!text.trim()) { setError("Add some CV text first — upload a file or paste it."); return; }
    setError("");
    setBusy(true);
    let r, e2 = "";
    if (GEMINI.key) {
      try { r = await geminiReview(text); }
      catch (e) { e2 = shortErr(e); r = analyzeText(text); }
    } else {
      await new Promise((res) => setTimeout(res, 500));
      r = analyzeText(text);
    }
    setApiErr(e2);
    setResult(r);
    setBusy(false);
  };

  return (
    <div className="checker">
      <header className="topbar no-print">
        <button className="icon-btn" onClick={onHome} aria-label="Back to home"><ArrowLeft size={20} /></button>
        <Logo size="sm" />
        <button className="btn btn-sm btn-ghost" onClick={onBuild}>Build new</button>
      </header>

      <div className="checker-body">
        <div className="checker-head">
          <span className="eyebrow">CV checker</span>
          <h1>Check your CV against the standards</h1>
          <p>Upload a PDF, Word file, or paste your CV text. You'll get a score, an ATS check, and a list of what to fix — nothing leaves your browser.</p>
        </div>

        <button className="dropzone" onClick={() => fileInput.current?.click()} disabled={reading}>
          <input ref={fileInput} type="file" accept=".pdf,.docx,.txt" hidden onChange={onFile} />
          {reading ? <div className="spinner sm" /> : <FileUp size={26} />}
          <span className="dz-main">{reading ? "Reading file…" : (fileName || "Upload a CV")}</span>
          <span className="dz-sub">{reading ? "Extracting text" : (fileName ? "Tap to choose another" : "PDF, Word (.docx), or text (.txt)")}</span>
        </button>

        <div className="checker-or"><span>or paste the text</span></div>

        <textarea
          className="input textarea checker-text"
          rows={8}
          placeholder="Paste your CV text here…"
          value={text}
          onChange={(e) => { setText(e.target.value); setResult(null); }}
        />

        {error && <p className="checker-err">{error}</p>}

        <KeyField />

        <button className="btn btn-accent btn-block btn-lg" onClick={analyze} disabled={busy}>
          {busy ? "Checking…" : <><Sparkles size={17} /> Check my CV</>}
        </button>

        {busy && <div className="ai-loading"><div className="spinner" /><p>Reading your CV…</p></div>}

        {result && !busy && (
          <div className="checker-result">
            <ReviewResult result={result} onRerun={analyze} err={apiErr} />
            <button className="btn btn-primary btn-block" onClick={onBuild}>
              <Pencil size={16} /> Rebuild it in the editor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== AI LOGIC ================================= */
/*
  runAIAnalysis is the single seam for upgrading to a real model.
  Today it returns the local heuristic result. To use an LLM later, replace the
  body with a fetch to your endpoint (or the Anthropic API) and return the same
  shape: { score, grade, summary, ats, strengths[], missing[], suggestions[], keywords[] }.
*/
/* Set this to your backend once it's running, e.g. "http://localhost:8000/api/review".
   Leave empty to use the built-in local analyzer (no key, no network). */
const REVIEW_ENDPOINT = "";

/* Runtime-only Gemini key. Entered in the UI, kept in memory, never persisted
   and never written into the source. Lets you test the real model with no backend. */
const GEMINI = { key: "", model: "gemini-2.5-flash" };

const GEMINI_SYSTEM = `You are a strict but fair CV/resume reviewer. Return ONLY a JSON object (no markdown) with EXACTLY these keys: "score" (int 0-100), "grade" ("Needs work"|"Getting there"|"Strong"|"Excellent"), "summary" (one short sentence), "ats" (int 0-100), "strengths" (array of short strings), "missing" (array), "suggestions" (array of concrete fixes incl. better wording), "keywords" (array, max 6). Be specific. Never invent facts about the candidate.`;

function cvToText(cv) {
  const parts = [cv.fullName, cv.title, cv.summary, (cv.skills || []).join(", ")];
  (cv.experience || []).forEach((e) => parts.push(`${e.position} at ${e.company}. ${e.description} ${e.achievements}`));
  (cv.education || []).forEach((e) => parts.push(`${e.degree} ${e.field}, ${e.institution}`));
  (cv.projects || []).forEach((p) => parts.push(`Project: ${p.name}. ${p.description} ${p.technologies}`));
  return parts.filter((p) => (p || "").trim()).join("\n");
}

async function geminiReview(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI.model}:generateContent?key=${GEMINI.key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: GEMINI_SYSTEM }] },
      contents: [{ parts: [{ text }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const out = JSON.parse(data.candidates[0].content.parts[0].text);
  return {
    score: Number(out.score) || 0, ats: Number(out.ats) || 0,
    grade: out.grade || "", summary: out.summary || "",
    strengths: out.strengths || [], missing: out.missing || [],
    suggestions: out.suggestions || [], keywords: out.keywords || [],
    source: "gemini",
  };
}

async function runAIAnalysis(cv) {
  if (GEMINI.key) {
    try { return await geminiReview(cvToText(cv)); } catch { /* fall back */ }
  }
  if (REVIEW_ENDPOINT) {
    try {
      const res = await fetch(REVIEW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv }),
      });
      if (res.ok) return await res.json();
    } catch { /* fall back */ }
  }
  await new Promise((r) => setTimeout(r, 650));
  return analyzeLocally(cv);
}

const WEAK_VERBS = ["responsible for", "worked on", "helped", "assisted", "involved in", "duties included"];
const ACTION_VERBS = ["built","led","designed","automated","developed","launched","cut","reduced","increased","improved","created","managed","shipped","delivered","optimized","migrated","implemented"];
const NUM_RE = /\d|%|\$/;

/* Analyze raw CV text (uploaded or pasted) against common CV/ATS standards. */
function analyzeText(raw) {
  const text = raw.replace(/\r/g, "");
  const low = text.toLowerCase();
  const wc = words(text);
  const strengths = [], missing = [], suggestions = [];
  let score = 0;

  // Contact details
  const hasEmail = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(text);
  const hasPhone = /(\+?\d[\d\s().-]{7,})/.test(text);
  if (hasEmail) score += 8; else missing.push("No email address found.");
  if (hasPhone) score += 6; else missing.push("No phone number found.");
  if (hasEmail && hasPhone) strengths.push("Contact details are present.");

  // Links / online presence
  const hasLink = /(linkedin\.com|github\.com|https?:\/\/|\.dev\b|\.io\b|portfolio)/i.test(low);
  if (hasLink) { score += 5; strengths.push("Includes an online profile or link."); }
  else suggestions.push("Add a LinkedIn or portfolio/GitHub link.");

  // Expected sections
  const sections = [
    { re: /(summary|profile|objective|about)/, label: "summary/profile", pts: 6, miss: "Add a short summary or profile at the top." },
    { re: /(experience|employment|work history)/, label: "experience", pts: 12, miss: "No clear work experience section." },
    { re: /(education|academic|degree|university|bachelor|master)/, label: "education", pts: 7, miss: "No education section found." },
    { re: /(skills|technologies|competencies)/, label: "skills", pts: 8, miss: "No skills section found." },
  ];
  const found = [];
  sections.forEach((s) => {
    if (s.re.test(low)) { score += s.pts; found.push(s.label); }
    else missing.push(s.miss);
  });
  if (found.length >= 3) strengths.push(`Has the core sections (${found.join(", ")}).`);

  // Length
  if (wc < 150) { suggestions.push("CV looks short — aim for ~250–700 words of real content."); }
  else if (wc > 900) { suggestions.push("CV is long — tighten it toward 1–2 pages."); score += 4; }
  else { score += 10; strengths.push("Length is in a healthy range."); }

  // Quantified achievements
  const sentences = text.split(/\n|\.\s/).map((s) => s.trim()).filter(Boolean);
  const quantified = sentences.filter((s) => NUM_RE.test(s)).length;
  if (quantified >= 3) { score += 10; strengths.push("Achievements are backed by numbers."); }
  else suggestions.push("Quantify more results (%, time saved, scale, revenue).");

  // Action vs weak verbs
  const weakHits = WEAK_VERBS.filter((v) => low.includes(v));
  const actionHits = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`).test(low));
  if (weakHits.length) suggestions.push(`Replace weak phrases (e.g. "${weakHits[0]}") with action verbs like Built, Led, Cut.`);
  else score += 4;
  if (actionHits.length >= 3) { score += 5; strengths.push("Uses strong action verbs."); }

  score = Math.max(0, Math.min(100, Math.round(score)));

  // ATS score: rewards plain structure + sections + contact + keywords
  let ats = 45;
  if (hasEmail && hasPhone) ats += 12;
  if (found.length >= 3) ats += 18;
  if (quantified > 0) ats += 8;
  if (hasLink) ats += 5;
  if (/[│|]{2,}|\t{2,}/.test(text)) { ats -= 12; suggestions.push("Avoid tables/columns — many ATS parsers garble them."); }
  ats = Math.max(0, Math.min(100, ats));

  const grade = score >= 85 ? "Excellent" : score >= 70 ? "Strong" : score >= 50 ? "Getting there" : "Needs work";
  const summary =
    score >= 85 ? "Meets the standards well — minor polish only." :
    score >= 70 ? "A solid CV with a few clear fixes left." :
    score >= 50 ? "The basics are here — close the gaps below." :
    "Several essentials are missing — start with the flagged items.";

  // Keyword hints from detected tech terms
  const kwPool = new Set();
  [["docker","Containerization"],["aws","Cloud"],["python","Python"],["react","React"],
   ["sql","Databases"],["agile","Agile"],["api","APIs"],["linux","Linux"]]
    .forEach(([t, kw]) => { if (low.includes(t)) kwPool.add(kw); });
  const keywords = [...kwPool].slice(0, 6);

  return { score, grade, summary, ats, strengths, missing, suggestions, keywords, source: "local" };
}

function analyzeLocally(cv) {
  const strengths = [], missing = [], suggestions = [];
  let score = 0;

  // Completeness (max ~55)
  if (cv.fullName) score += 5; else missing.push("Add your full name.");
  if (cv.title) score += 5; else missing.push("Add a professional title under your name.");
  if (cv.email && cv.phone) score += 8; else missing.push("Include both email and phone in contact details.");
  if (cv.location) score += 2;
  if (cv.summary) {
    const w = words(cv.summary);
    if (w >= 25 && w <= 90) { score += 10; strengths.push("Summary is a good length."); }
    else { score += 4; suggestions.push(w < 25 ? "Expand your summary to 2–3 lines." : "Trim the summary — keep it tight (under ~90 words)."); }
  } else missing.push("Write a short professional summary.");

  if (cv.experience.length > 0) { score += 12; strengths.push(`${cv.experience.length} experience entr${cv.experience.length > 1 ? "ies" : "y"} listed.`); }
  else missing.push("Add at least one work experience entry.");

  if (cv.education.length > 0) score += 5; else suggestions.push("Add your education.");
  if (cv.skills.length >= 5) { score += 8; strengths.push("Solid skills list."); }
  else missing.push("List at least 5 skills.");
  if (cv.projects.length > 0) { score += 5; strengths.push("Projects included — great for technical roles."); }

  // Quality of experience bullets
  let bulletCount = 0, quantified = 0, weakHits = 0;
  cv.experience.forEach((e) => {
    lines(e.achievements).forEach((b) => {
      bulletCount++;
      if (NUM_RE.test(b)) quantified++;
      const low = b.toLowerCase();
      if (WEAK_VERBS.some((v) => low.includes(v))) weakHits++;
    });
  });
  if (bulletCount > 0) {
    const ratio = quantified / bulletCount;
    if (ratio >= 0.4) { score += 8; strengths.push("Achievements are backed by numbers."); }
    else suggestions.push("Quantify more achievements (%, time saved, scale, $).");
    if (weakHits > 0) suggestions.push(`Replace weak phrases like "responsible for" with action verbs (Built, Led, Automated, Cut).`);
    else score += 2;
  } else if (cv.experience.length > 0) {
    suggestions.push("Add achievement bullets under each role, not just a description.");
  }

  // Links / online presence
  const hasLink = cv.github || cv.linkedin || cv.website || cv.portfolio;
  if (hasLink) score += 4; else suggestions.push("Add a LinkedIn or GitHub link.");

  score = Math.max(0, Math.min(100, Math.round(score)));

  // ATS score: distinct, leans on structure + keywords + plain text
  let ats = 50;
  if (cv.skills.length >= 6) ats += 15;
  if (bulletCount >= 3) ats += 10;
  if (cv.summary) ats += 10;
  if (hasLink) ats += 5;
  if (quantified > 0) ats += 10;
  ats = Math.min(100, ats);

  const grade = score >= 85 ? "Excellent" : score >= 70 ? "Strong" : score >= 50 ? "Getting there" : "Needs work";
  const summary =
    score >= 85 ? "Recruiter-ready. Minor polish only." :
    score >= 70 ? "A good CV with a few clear wins left." :
    score >= 50 ? "The bones are here — fill the gaps below." :
    "Add the missing essentials to get this interview-ready.";

  // Keyword suggestions — pulled from titles/skills, generic but useful
  const kwPool = new Set();
  const text = (cv.title + " " + cv.skills.join(" ") + " " + cv.summary).toLowerCase();
  [["docker","Containerization"],["aws","Cloud"],["python","CI/CD"],["linux","Automation"],
   ["fastapi","REST APIs"],["sql","Databases"],["devops","Infrastructure as Code"]]
    .forEach(([trigger, kw]) => { if (text.includes(trigger)) kwPool.add(kw); });
  if (cv.title) kwPool.add(cv.title);
  const keywords = [...kwPool].slice(0, 6);

  return { score, grade, summary, ats, strengths, missing, suggestions, keywords, source: "local" };
}

/* ----------------------------- HELPERS ---------------------------------- */
const lines = (s) => (s || "").split("\n").map((x) => x.trim()).filter(Boolean);
const words = (s) => (s || "").trim().split(/\s+/).filter(Boolean).length;
const prefixUrl = (u) => (!u ? "#" : /^https?:\/\//i.test(u) ? u : `https://${u}`);

/* Turn a fetch/parse error into a short, useful message. */
function shortErr(e) {
  const m = (e && e.message) ? e.message : String(e);
  if (/Failed to fetch|NetworkError|load failed/i.test(m))
    return "The request was blocked (likely the sandbox/CSP, or no internet). Run the app in your own dev server, not the preview.";
  if (/API_KEY_INVALID|API key not valid|400/i.test(m)) return "The API key was rejected (invalid or wrong project).";
  if (/PERMISSION_DENIED|403/i.test(m)) return "Permission denied — check the key has Gemini API access.";
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(m)) return "Rate limit / quota hit. Wait a moment or check your free-tier limits.";
  if (/404|not found/i.test(m)) return "Model name not found — try gemini-2.5-flash or gemini-2.5-flash-lite.";
  return m.slice(0, 180);
}

/* Export to PDF.
   The sandbox blocks the iframe's own window.print(), so instead we serialize
   the rendered CV into a standalone, print-ready HTML document and open it in a
   new tab where the browser's native "Save as PDF" works. If popups are blocked
   we download that document as an .html file the user can open and print. */
function exportCV(name) {
  const node = document.querySelector(".print-source .cv-sheet");
  if (!node) return;
  const fileBase = (name || "CV").trim().replace(/\s+/g, "_") || "CV";
  const doc =
`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${fileBase} — CV</title>
<style>${CV_EXPORT_CSS}</style>
</head><body>
<div class="export-wrap">${node.outerHTML}</div>
<div class="export-bar no-print">
  <button onclick="window.print()">Save as PDF</button>
  <span>Use your browser's print dialog → choose "Save as PDF".</span>
</div>
<script>window.addEventListener('load',function(){setTimeout(function(){try{window.print();}catch(e){}},400);});<\/script>
</body></html>`;
  const blob = new Blob([doc], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileBase}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* Self-contained styles for the exported/printed CV document. */
const CV_EXPORT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
:root{--ink:#202331;--ink-2:#5a5f73;--ink-3:#8a8fa3;--accent:#2f5e54;--accent-soft:#e4efe9;--accent-ink:#1f3f39;--hair:#e1e2e9}
*{box-sizing:border-box}
body{margin:0;background:#e9eaef;font-family:'Inter',system-ui,sans-serif;color:#2a2d3a}
.export-wrap{max-width:760px;margin:24px auto;padding:0 16px}
.export-bar{position:fixed;bottom:0;left:0;right:0;display:flex;gap:14px;align-items:center;justify-content:center;
  background:#202331;color:#fff;padding:12px;font-size:13px;flex-wrap:wrap;text-align:center}
.export-bar button{background:#2f5e54;color:#fff;border:none;border-radius:999px;padding:9px 20px;font:inherit;font-weight:600;cursor:pointer}
.cv-sheet{background:#fff;border-radius:6px;box-shadow:0 12px 40px rgba(32,35,49,.14);padding:46px 50px;font-size:13px;line-height:1.55}
.cv-header{display:flex;gap:20px;align-items:flex-start;padding-bottom:16px;border-bottom:2px solid var(--ink);margin-bottom:18px}
.cv-photo{width:78px;height:78px;border-radius:50%;background:#eee center/cover no-repeat;flex:none}
.cv-name{font-family:'Fraunces',serif;font-weight:600;font-size:30px;line-height:1.05;margin:0;color:var(--ink)}
.cv-role{font-size:14.5px;color:var(--accent);font-weight:600;margin:4px 0 9px}
.cv-contact{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:12px;color:var(--ink-2)}
.cv-contact span{display:inline-flex;align-items:center;gap:5px}
.cv-contact svg,.cv-links svg{color:var(--accent)}
.cv-links{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:12px;margin-top:6px}
.cv-links a{display:inline-flex;align-items:center;gap:5px;color:var(--accent-ink);text-decoration:none}
.cv-empty{display:none}
.cv-section{margin-bottom:18px}
.cv-section-title{font-weight:700;font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--accent);margin:0 0 10px;padding-bottom:4px;border-bottom:1px solid var(--hair)}
.cv-summary{margin:0;color:#3a3d4a}
.cv-entry{margin-bottom:13px}
.cv-entry-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.cv-entry-title{font-weight:600;font-size:13.5px;color:var(--ink)}
.cv-at{font-weight:500;color:var(--ink-2)}
.cv-date{font-size:11.5px;color:var(--ink-3);white-space:nowrap;flex:none}
.cv-proj-links{display:flex;gap:10px}.cv-proj-links a{color:var(--accent);text-decoration:none}
.cv-entry-desc{margin:3px 0 0;color:#414452}
.cv-tech{margin:4px 0 0;font-size:12px;color:var(--accent-ink);font-weight:500}
.cv-bullets{margin:5px 0 0;padding-left:18px;color:#414452}
.cv-bullets li{margin-bottom:2px}
.cv-row{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:6px}
.cv-row a{color:var(--accent-ink);text-decoration:none}
.cv-skills{display:flex;flex-wrap:wrap;gap:7px}
.cv-skills span{background:var(--accent-soft);color:var(--accent-ink);border-radius:6px;padding:4px 10px;font-size:12px;font-weight:500}
.cv-langs{display:flex;flex-wrap:wrap;gap:6px 22px;color:#414452}
@page{margin:14mm}
@media print{
  body{background:#fff}
  .export-bar,.no-print{display:none!important}
  .export-wrap{margin:0;padding:0;max-width:100%}
  .cv-sheet{box-shadow:none;border-radius:0;padding:0;font-size:11.5px}
  .cv-section,.cv-entry{break-inside:avoid}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}`;

/* ============================== STYLES =================================== */

function StyleSheet() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

:root{
  --ink:#202331; --ink-2:#5a5f73; --ink-3:#8a8fa3;
  --bg:#e9eaef; --surface:#ffffff; --paper:#ffffff;
  --accent:#2f5e54; --accent-soft:#e4efe9; --accent-ink:#1f3f39;
  --clay:#c97f54; --clay-soft:#f6e7dc;
  --hair:#e1e2e9; --hair-2:#d0d2dc;
  --good:#2f5e54; --good-soft:#e4efe9;
  --warn:#b5722a; --warn-soft:#f8ecdd;
  --tip:#3a4d8f; --tip-soft:#e6eaf6;
  --radius:16px; --radius-sm:10px;
  --shadow:0 1px 2px rgba(32,35,49,.04),0 8px 24px rgba(32,35,49,.07);
  --shadow-lg:0 12px 40px rgba(32,35,49,.14);
  --serif:'Fraunces',Georgia,serif;
  --sans:'Inter',system-ui,-apple-system,sans-serif;
}
*{box-sizing:border-box}
.cvb-root{font-family:var(--sans);color:var(--ink);background:var(--bg);min-height:100vh;-webkit-font-smoothing:antialiased;line-height:1.5}
.cvb-root button{font-family:inherit;cursor:pointer}
.cvb-root a{color:inherit}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}

/* ---------- buttons ---------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid transparent;
  border-radius:999px;font-weight:600;font-size:14px;padding:10px 18px;transition:.18s;white-space:nowrap}
.btn-sm{padding:7px 13px;font-size:13px}
.btn-lg{padding:14px 26px;font-size:15px}
.btn-block{width:100%}
.btn-primary{background:var(--ink);color:#fff}
.btn-primary:hover{background:#0f111c}
.btn-accent{background:var(--accent);color:#fff}
.btn-accent:hover{background:var(--accent-ink)}
.btn-ghost{background:transparent;border-color:var(--hair-2);color:var(--ink-2)}
.btn-ghost:hover{border-color:var(--ink-3);color:var(--ink)}
.btn-ghost.danger{color:var(--clay);border-color:var(--clay-soft)}
.btn-dashed{background:transparent;border:1.5px dashed var(--hair-2);color:var(--ink-2);border-radius:var(--radius-sm)}
.btn-dashed:hover{border-color:var(--accent);color:var(--accent)}
.icon-btn{display:inline-flex;align-items:center;justify-content:center;border:none;background:transparent;color:var(--ink-2);padding:7px;border-radius:9px;transition:.15s}
.icon-btn:hover{background:var(--hair);color:var(--ink)}
.icon-btn.xs{padding:5px;border-radius:7px}
.icon-btn.danger:hover{background:var(--clay-soft);color:var(--clay)}
.icon-btn:disabled{opacity:.3;cursor:not-allowed}

.logo{display:inline-flex;align-items:center;gap:9px;user-select:none}
.logo-mark{display:inline-flex;align-items:center;justify-content:center;
  background:linear-gradient(140deg,var(--accent) 0%,var(--accent-ink) 100%);color:#fff;
  border-radius:9px;box-shadow:0 3px 8px rgba(47,94,84,.32);flex:none}
.logo-md .logo-mark{width:30px;height:30px;border-radius:10px}
.logo-sm .logo-mark{width:25px;height:25px;border-radius:8px}
.logo-word{font-family:var(--sans);font-weight:800;letter-spacing:.04em;color:var(--ink);line-height:1}
.logo-md .logo-word{font-size:20px}
.logo-sm .logo-word{font-size:17px}
.logo-cv{font-family:var(--serif);font-weight:600;font-style:italic;letter-spacing:0;color:var(--accent);margin-left:1px}
.eyebrow{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
.eyebrow-light{color:var(--clay)}

/* ============================ HOME ============================ */
.home{max-width:1080px;margin:0 auto;padding:0 20px 60px}
.home-nav{display:flex;align-items:center;justify-content:space-between;padding:20px 0}
.brand{font-family:var(--serif);font-size:21px;font-weight:600}
.hero{display:grid;grid-template-columns:1.05fr .95fr;gap:40px;align-items:center;padding:30px 0 50px}
.hero-copy .eyebrow{display:block;margin-bottom:16px}
.hero-title{font-family:var(--serif);font-weight:500;font-size:clamp(40px,7vw,68px);line-height:1.02;letter-spacing:-.02em;margin:0 0 18px}
.hero-sub{font-size:16px;color:var(--ink-2);max-width:30em;margin:0 0 26px}
.hero-actions{display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.hero-btn-row{display:flex;gap:10px;flex-wrap:wrap}
.hero-note{font-size:13px;color:var(--ink-3)}

/* ---------- CV checker ---------- */
.checker{min-height:100vh;display:flex;flex-direction:column}
.checker-body{width:100%;max-width:620px;margin:0 auto;padding:24px 16px 60px;display:flex;flex-direction:column;gap:16px}
.checker-head{text-align:center;margin-bottom:4px}
.checker-head .eyebrow{display:block;margin-bottom:8px}
.checker-head h1{font-family:var(--serif);font-weight:500;font-size:clamp(26px,5vw,34px);letter-spacing:-.01em;margin:0 0 10px}
.checker-head p{color:var(--ink-2);font-size:14.5px;margin:0;max-width:42ch;margin-inline:auto}
.dropzone{display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;
  background:var(--surface);border:1.5px dashed var(--hair-2);border-radius:var(--radius);padding:30px 20px;
  color:var(--ink-2);transition:.18s}
.dropzone:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}
.dropzone svg{color:var(--accent)}
.dz-main{font-weight:600;font-size:15px;color:var(--ink)}
.dz-sub{font-size:12.5px;color:var(--ink-3)}
.checker-or{display:flex;align-items:center;gap:12px;color:var(--ink-3);font-size:12.5px;text-transform:uppercase;letter-spacing:.06em}
.checker-or::before,.checker-or::after{content:"";flex:1;height:1px;background:var(--hair)}
.checker-text{font-family:inherit;line-height:1.5}
.checker-err{color:var(--clay);font-size:13px;margin:0;background:var(--clay-soft);border-radius:10px;padding:10px 13px}
.checker-result{display:flex;flex-direction:column;gap:14px;margin-top:8px;animation:accIn .25s ease}
.hero-art{position:relative;height:380px;display:flex;align-items:center;justify-content:center}
.hero-sheet{position:absolute;width:300px;height:380px;border-radius:14px}
.hero-sheet-back{background:linear-gradient(135deg,var(--accent-soft),var(--clay-soft));transform:rotate(-6deg) translate(14px,10px);box-shadow:var(--shadow)}
.hero-sheet-front{background:var(--paper);box-shadow:var(--shadow-lg);transform:rotate(3deg);overflow:hidden;animation:floatIn .8s ease}
@keyframes floatIn{from{opacity:0;transform:rotate(3deg) translateY(20px)}to{opacity:1;transform:rotate(3deg) translateY(0)}}

.mini-sheet{padding:24px 22px}
.mini-head{display:flex;gap:12px;align-items:center;margin-bottom:18px}
.mini-avatar{width:46px;height:46px;border-radius:50%;background:var(--accent-soft);flex:none}
.mini-name{width:120px;height:13px;border-radius:4px;background:var(--ink);opacity:.85;margin-bottom:7px}
.mini-role{width:90px;height:9px;border-radius:4px;background:var(--clay)}
.mini-line{height:8px;border-radius:4px;background:var(--hair-2);margin-bottom:9px}
.mini-line.w90{width:90%}.mini-line.w80{width:80%}.mini-line.w70{width:70%}.mini-line.w60{width:60%}
.mini-sec{height:9px;width:64px;border-radius:4px;background:var(--accent);margin:18px 0 12px;opacity:.9}
.mini-tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:4px}
.mini-tags span{height:18px;border-radius:999px;background:var(--accent-soft)}

.section-h{font-family:var(--serif);font-weight:500;font-size:28px;letter-spacing:-.01em;margin:0 0 24px}
.features{padding:30px 0}
.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.feature-card{background:var(--surface);border:1px solid var(--hair);border-radius:var(--radius);padding:22px;transition:.2s}
.feature-card:hover{transform:translateY(-3px);box-shadow:var(--shadow)}
.feature-icon{display:inline-flex;padding:9px;border-radius:10px;background:var(--accent-soft);color:var(--accent);margin-bottom:12px}
.feature-card h3{font-size:15px;margin:0 0 6px}
.feature-card p{font-size:13.5px;color:var(--ink-2);margin:0}

.showcase{margin:40px 0;background:var(--ink);border-radius:24px;color:#fff;overflow:hidden}
.showcase-inner{display:grid;grid-template-columns:1.4fr 1fr;gap:30px;align-items:center;padding:44px}
.showcase-text h2{font-family:var(--serif);font-weight:500;font-size:30px;margin:14px 0 14px;letter-spacing:-.01em}
.showcase-text p{color:#c9ccd8;font-size:15px;margin:0 0 18px;max-width:34em}
.check-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:9px}
.check-list li{display:flex;align-items:center;gap:9px;font-size:14px;color:#e7e9f0}
.check-list svg{color:var(--clay);flex:none}
.showcase-score{display:flex;flex-direction:column;align-items:center;gap:10px}
.showcase-score .ring-num b{color:#fff}.showcase-score .ring-num span{color:#c9ccd8}
.showcase-score-label{font-size:12px;color:#9aa0b4;text-transform:uppercase;letter-spacing:.07em}

.cta{text-align:center;padding:56px 0 30px}
.cta h2{font-family:var(--serif);font-weight:500;font-size:32px;margin:0 0 22px;letter-spacing:-.01em}
.home-foot{text-align:center;color:var(--ink-3);font-size:13px;padding-top:20px;border-top:1px solid var(--hair)}

/* ============================ BUILDER ============================ */
.builder{min-height:100vh;display:flex;flex-direction:column}
.topbar{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;
  gap:12px;padding:11px 16px;background:rgba(233,234,239,.85);backdrop-filter:blur(10px);border-bottom:1px solid var(--hair)}
.topbar-title{font-family:var(--serif);font-size:17px;font-weight:600}
.tabbar{display:none}
.builder-body{flex:1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0;align-items:start}

.pane{min-width:0}
.form-pane{padding:18px 16px 40px;max-width:620px;margin:0 auto;width:100%}
.preview-pane{position:sticky;top:53px;height:calc(100vh - 53px);background:var(--bg);border-left:1px solid var(--hair)}
.preview-scroll{height:100%;overflow:auto;padding:26px;display:flex;justify-content:center;align-items:flex-start}

.form-col{display:flex;flex-direction:column;gap:12px}
.desktop-review{margin-bottom:2px}

/* accordion */
.acc{background:var(--surface);border:1px solid var(--hair);border-radius:var(--radius);overflow:hidden}
.acc-head{width:100%;display:flex;align-items:center;justify-content:space-between;padding:15px 17px;border:none;background:transparent;font-size:15px;font-weight:600;color:var(--ink)}
.acc-title{display:flex;align-items:center;gap:10px}
.acc-title svg{color:var(--accent)}
.acc-chev{color:var(--ink-3);transition:transform .2s}
.acc-open .acc-chev{transform:rotate(90deg)}
.acc-body{padding:4px 17px 18px;display:flex;flex-direction:column;gap:13px;animation:accIn .2s ease}
@keyframes accIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}

/* fields */
.field{display:flex;flex-direction:column;gap:6px}
.field-label{font-size:12.5px;font-weight:600;color:var(--ink-2)}
.input{width:100%;border:1px solid var(--hair-2);border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;color:var(--ink);background:#fff;transition:.15s}
.input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.input:disabled{background:#f4f5f8;color:var(--ink-3)}
.textarea{resize:vertical;min-height:60px;line-height:1.5}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:11px}

.photo-row{display:flex;gap:14px;align-items:center}
.photo-prev{width:64px;height:64px;border-radius:14px;background:var(--accent-soft) center/cover no-repeat;display:flex;align-items:center;justify-content:center;color:var(--accent);font-size:11px;font-weight:600;flex:none;border:1px solid var(--hair)}
.photo-actions{display:flex;flex-direction:column;gap:7px;align-items:flex-start}

.toggle{display:flex;align-items:center;gap:10px;border:none;background:transparent;padding:2px 0;color:var(--ink-2);font-size:13.5px}
.toggle-track{width:38px;height:22px;border-radius:999px;background:var(--hair-2);position:relative;transition:.2s;flex:none}
.toggle-track.on{background:var(--accent)}
.toggle-knob{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:.2s;box-shadow:0 1px 2px rgba(0,0,0,.2)}
.toggle-track.on .toggle-knob{transform:translateX(16px)}

/* tags */
.taglist{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px;min-height:8px}
.tag{display:inline-flex;align-items:center;gap:5px;background:var(--accent-soft);color:var(--accent-ink);border-radius:999px;padding:5px 10px;font-size:13px;font-weight:500}
.tag button{border:none;background:transparent;color:var(--accent);display:inline-flex;padding:0}
.tag-empty{font-size:13px;color:var(--ink-3)}
.tag-add{display:flex;gap:8px}

/* repeater */
.repeater{display:flex;flex-direction:column;gap:11px}
.rep-item{border:1px solid var(--hair);border-radius:12px;overflow:hidden;background:#fbfbfd}
.rep-head{display:flex;align-items:center;justify-content:space-between;padding:9px 10px 9px 12px;background:#fff;border-bottom:1px solid var(--hair)}
.rep-toggle{display:flex;align-items:center;gap:8px;border:none;background:transparent;font-weight:600;font-size:13.5px;color:var(--ink);min-width:0}
.rep-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rep-chev{color:var(--ink-3);transition:transform .2s;flex:none}
.rep-chev.open{transform:rotate(90deg)}
.rep-tools{display:flex;gap:2px;flex:none}
.rep-body{padding:13px;display:flex;flex-direction:column;gap:12px}

.form-foot{margin-top:8px}

/* ============================ CV SHEET ============================ */
.cv-sheet{background:var(--paper);width:100%;max-width:760px;border-radius:6px;box-shadow:var(--shadow-lg);
  padding:46px 50px;font-size:13px;color:#2a2d3a;line-height:1.55}
.cv-header{display:flex;gap:20px;align-items:flex-start;padding-bottom:16px;border-bottom:2px solid var(--ink);margin-bottom:18px}
.cv-photo{width:78px;height:78px;border-radius:50%;background:#eee center/cover no-repeat;flex:none}
.cv-headtext{min-width:0}
.cv-name{font-family:var(--serif);font-weight:600;font-size:30px;line-height:1.05;letter-spacing:-.01em;margin:0;color:var(--ink)}
.cv-role{font-size:14.5px;color:var(--accent);font-weight:600;margin:4px 0 9px}
.cv-contact{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:12px;color:var(--ink-2)}
.cv-contact span{display:inline-flex;align-items:center;gap:5px}
.cv-contact svg{color:var(--accent)}
.cv-links{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:12px;margin-top:6px}
.cv-links a{display:inline-flex;align-items:center;gap:5px;color:var(--accent-ink);text-decoration:none;border-bottom:1px solid var(--accent-soft)}
.cv-links svg{color:var(--accent)}
.cv-empty{color:var(--ink-3);font-style:italic;text-align:center;padding:30px 0}

.cv-section{margin-bottom:18px}
.cv-section-title{font-family:var(--sans);font-weight:700;font-size:11px;letter-spacing:.13em;text-transform:uppercase;
  color:var(--accent);margin:0 0 10px;padding-bottom:4px;border-bottom:1px solid var(--hair)}
.cv-summary{margin:0;color:#3a3d4a}
.cv-entry{margin-bottom:13px}
.cv-entry:last-child{margin-bottom:0}
.cv-entry-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.cv-entry-title{font-weight:600;font-size:13.5px;color:var(--ink)}
.cv-at{font-weight:500;color:var(--ink-2)}
.cv-date{font-size:11.5px;color:var(--ink-3);white-space:nowrap;flex:none}
.cv-proj-links{display:flex;gap:10px}
.cv-proj-links a{color:var(--accent);text-decoration:none;border-bottom:1px solid var(--accent-soft)}
.cv-entry-desc{margin:3px 0 0;color:#414452}
.cv-tech{margin:4px 0 0;font-size:12px;color:var(--accent-ink);font-weight:500}
.cv-bullets{margin:5px 0 0;padding-left:18px;color:#414452}
.cv-bullets li{margin-bottom:2px}
.cv-row{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:6px}
.cv-row a{color:var(--accent-ink);text-decoration:none;border-bottom:1px solid var(--accent-soft)}
.cv-skills{display:flex;flex-wrap:wrap;gap:7px}
.cv-skills span{background:var(--accent-soft);color:var(--accent-ink);border-radius:6px;padding:4px 10px;font-size:12px;font-weight:500}
.cv-langs{display:flex;flex-wrap:wrap;gap:6px 22px;color:#414452}

/* ============================ AI PANEL ============================ */
.review-pane.review-mobile{padding:18px 16px 40px;max-width:620px;margin:0 auto;width:100%}
.ai-panel{display:flex;flex-direction:column;gap:16px}
.ai-intro{background:var(--surface);border:1px solid var(--hair);border-radius:var(--radius);padding:28px 22px;text-align:center}
.ai-spark{display:inline-flex;padding:13px;border-radius:14px;background:var(--accent-soft);color:var(--accent);margin-bottom:12px}
.ai-intro h3{margin:0 0 6px;font-size:18px;font-family:var(--serif);font-weight:600}
.ai-intro p{margin:0 0 18px;color:var(--ink-2);font-size:14px}
.keyfield{text-align:left;margin-bottom:14px}
.keyfield-toggle{display:inline-flex;align-items:center;gap:5px;border:none;background:transparent;color:var(--accent);font-weight:600;font-size:13px;padding:0}
.keyfield-toggle svg{transition:transform .2s}
.keyfield-toggle svg.open{transform:rotate(90deg)}
.keyfield-body{margin-top:9px;display:flex;flex-direction:column;gap:7px}
.keyfield-note{font-size:11.5px;color:var(--ink-3);margin:0;line-height:1.45}
.ai-loading{text-align:center;padding:50px 0;color:var(--ink-2)}
.spinner{width:34px;height:34px;border:3px solid var(--hair);border-top-color:var(--accent);border-radius:50%;margin:0 auto 14px;animation:spin .8s linear infinite}
.spinner.sm{width:26px;height:26px;border-width:2.5px;margin:0}
@keyframes spin{to{transform:rotate(360deg)}}

.ai-result{display:flex;flex-direction:column;gap:14px}
.ai-score-card{background:var(--surface);border:1px solid var(--hair);border-radius:var(--radius);padding:20px;display:flex;gap:18px;align-items:center}
.ai-score-meta{min-width:0}
.ai-grade{font-family:var(--serif);font-size:20px;font-weight:600;color:var(--accent)}
.ai-score-meta p{margin:4px 0 10px;font-size:13.5px;color:var(--ink-2)}
.ring{position:relative;flex:none}
.ring-prog{transition:stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)}
.ring-num{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
.ring-num b{font-size:26px;font-weight:700;color:var(--ink)}
.ring-num span{font-size:11px;color:var(--ink-3);margin-top:2px}

.meter{background:var(--surface);border:1px solid var(--hair);border-radius:var(--radius-sm);padding:13px 15px}
.meter-top{display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:8px}
.meter-track{height:7px;border-radius:999px;background:var(--hair);overflow:hidden}
.meter-fill{height:100%;border-radius:999px;background:var(--accent);transition:width 1s cubic-bezier(.22,1,.36,1)}

.fb{border-radius:var(--radius-sm);padding:13px 15px;border:1px solid}
.fb h4{margin:0 0 8px;font-size:13.5px;display:flex;align-items:center;gap:7px}
.fb ul{margin:0;padding-left:18px;font-size:13px}
.fb li{margin-bottom:4px}
.fb-good{background:var(--good-soft);border-color:#cfe3da}.fb-good h4{color:var(--good)}
.fb-warn{background:var(--warn-soft);border-color:#eed9c0}.fb-warn h4{color:var(--warn)}
.fb-tip{background:var(--tip-soft);border-color:#d2daf0}.fb-tip h4{color:var(--tip)}

.kw-block{background:var(--surface);border:1px solid var(--hair);border-radius:var(--radius-sm);padding:13px 15px}
.kw-block h4{margin:0 0 9px;font-size:13.5px}
.kw-list{display:flex;flex-wrap:wrap;gap:7px}
.kw-list span{background:var(--clay-soft);color:var(--clay);border-radius:999px;padding:4px 11px;font-size:12px;font-weight:500}
.ai-foot-note{font-size:11.5px;color:var(--ink-3);text-align:center;margin:2px 0 0}
.ai-foot-note code{background:var(--hair);padding:1px 5px;border-radius:4px;font-size:11px}
.ai-srcbadge{align-self:flex-start;font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:999px}
.src-gemini{background:var(--accent-soft);color:var(--accent-ink)}
.src-local{background:var(--hair);color:var(--ink-2)}
.ai-errbox{display:flex;gap:10px;align-items:flex-start;background:var(--warn-soft);border:1px solid #eed9c0;border-radius:10px;padding:11px 13px;color:var(--warn);font-size:12.5px}
.ai-errbox svg{flex:none;margin-top:1px}
.ai-errbox b{display:block;color:var(--warn);font-size:13px;margin-bottom:3px}
.ai-errbox span{color:#8a5a22;line-height:1.45}

/* slideover (desktop AI) */
.slideover-backdrop{position:fixed;inset:0;background:rgba(32,35,49,.4);z-index:50;display:flex;justify-content:flex-end;animation:fade .2s}
@keyframes fade{from{opacity:0}to{opacity:1}}
.slideover{width:min(440px,92vw);height:100%;background:var(--bg);box-shadow:var(--shadow-lg);display:flex;flex-direction:column;animation:slideIn .25s ease}
@keyframes slideIn{from{transform:translateX(30px);opacity:.6}to{transform:translateX(0);opacity:1}}
.slideover-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--hair);font-weight:600}
.slideover-head span{display:flex;align-items:center;gap:8px}
.slideover-head svg{color:var(--accent)}
.slideover-body{padding:18px;overflow:auto;flex:1}

/* ============================ RESPONSIVE ============================ */
@media (max-width:860px){
  .hero{grid-template-columns:1fr;gap:10px}
  .hero-art{height:300px;order:-1}
  .hero-sheet{width:230px;height:300px}
  .feature-grid{grid-template-columns:1fr 1fr}
  .showcase-inner{grid-template-columns:1fr;padding:30px;text-align:center}
  .showcase-text p{margin-inline:auto}
  .check-list{align-items:center}
}
@media (max-width:680px){
  .feature-grid{grid-template-columns:1fr}
  .tabbar{display:grid;grid-template-columns:repeat(3,1fr);position:sticky;top:53px;z-index:25;background:var(--surface);border-bottom:1px solid var(--hair)}
  .tab{display:flex;align-items:center;justify-content:center;gap:6px;border:none;background:transparent;padding:12px 4px;font-size:13px;font-weight:600;color:var(--ink-3);border-bottom:2px solid transparent}
  .tab-active{color:var(--accent);border-bottom-color:var(--accent)}
  .builder-body{grid-template-columns:1fr}
  .pane-hide-mobile{display:none}
  .preview-pane{position:static;height:auto;border-left:none}
  .preview-scroll{padding:16px 12px;height:auto}
  .cv-sheet{padding:30px 24px}
  .cv-name{font-size:25px}
  .cv-header{flex-direction:row}
  .grid-2{grid-template-columns:1fr}
  .hero-title{font-size:42px}
}

/* ============================ PRINT (PDF) ============================ */
.print-source{position:fixed;left:-99999px;top:0;width:760px}
@media print{
  @page{margin:14mm}
  .cvb-root{background:#fff}
  .no-print,.home-nav,.topbar,.tabbar,.form-pane,.preview-pane,.review-pane,.desktop-review,.slideover-backdrop{display:none!important}
  .print-source{position:static!important;left:0!important;width:100%!important}
  .print-source .cv-sheet{box-shadow:none!important;border-radius:0!important;max-width:100%!important;padding:0!important;font-size:11.5px}
  .cv-section,.cv-entry{break-inside:avoid}
  a{text-decoration:none!important}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
`}</style>
  );
}
