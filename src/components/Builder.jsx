import React, { useState, useCallback, useRef } from "react";
import {
  ArrowLeft, Download, Pencil, Eye, Sparkles, X,
  Upload, Link as LinkIcon, FileText, Briefcase, GraduationCap,
  Zap, FolderGit2, BadgeCheck, Languages, Award, Heart, Layers,
} from "lucide-react";
import Logo from "./Logo";
import CVSheet from "./CVSheet";
import AIPanel from "./AIPanel";
import Field from "./ui/Field";
import TextArea from "./ui/TextArea";
import Toggle from "./ui/Toggle";
import TagInput from "./ui/TagInput";
import Accordion from "./ui/Accordion";
import Repeater from "./ui/Repeater";
import { exportCV } from "../lib/export";
import { uid } from "../data/cv";

const TABS = [
  { id: "edit", label: "Edit", icon: <Pencil size={16} /> },
  { id: "preview", label: "Preview", icon: <Eye size={16} /> },
  { id: "review", label: "AI Review", icon: <Sparkles size={16} /> },
];

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
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="slideover-body"><AIPanel cv={cv} /></div>
          </div>
        </div>
      )}
    </div>
  );
}

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

export default function Builder({ cv, setCV, onHome }) {
  const [tab, setTab] = useState("edit");
  const set = useCallback((key, value) => setCV((c) => ({ ...c, [key]: value })), [setCV]);

  return (
    <div className="builder">
      <header className="topbar no-print">
        <button className="icon-btn" onClick={onHome} aria-label="Back to home">
          <ArrowLeft size={20} />
        </button>
        <Logo size="sm" />
        <button className="btn btn-sm btn-primary" onClick={() => exportCV(cv.fullName)}>
          <Download size={16} /> PDF
        </button>
      </header>

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
        <div className={`pane form-pane ${tab === "edit" ? "" : "pane-hide-mobile"}`}>
          <FormColumn cv={cv} setCV={setCV} set={set} />
        </div>

        <div className={`pane preview-pane ${tab === "preview" ? "" : "pane-hide-mobile"}`}>
          <div className="preview-scroll">
            <CVSheet cv={cv} />
          </div>
        </div>

        <div className={`pane review-pane ${tab === "review" ? "" : "pane-hide-mobile"} review-mobile`}>
          <AIPanel cv={cv} />
        </div>
      </div>
    </div>
  );
}
