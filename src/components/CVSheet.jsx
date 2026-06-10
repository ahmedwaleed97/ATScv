import React from "react";
import { Globe, Linkedin, Github, Link as LinkIcon, Mail, Phone, MapPin } from "lucide-react";
import { lines, prefixUrl } from "../lib/utils";

function Section({ title, children }) {
  return (
    <section className="cv-section">
      <h2 className="cv-section-title">{title}</h2>
      {children}
    </section>
  );
}

export default function CVSheet({ cv }) {
  const hasContact = cv.email || cv.phone || cv.location;
  const links = [
    cv.website && { icon: <Globe size={12} />, label: cv.website, url: cv.website },
    cv.linkedin && { icon: <Linkedin size={12} />, label: cv.linkedin, url: cv.linkedin },
    cv.github && { icon: <Github size={12} />, label: cv.github, url: cv.github },
    cv.portfolio && { icon: <LinkIcon size={12} />, label: cv.portfolio, url: cv.portfolio },
    ...cv.customLinks.filter((l) => l.url || l.label).map((l) => ({
      icon: <LinkIcon size={12} />, label: l.label || l.url, url: l.url,
    })),
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
                <a key={i} href={prefixUrl(l.url)} target="_blank" rel="noreferrer">
                  {l.icon}{l.label}
                </a>
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
                <span className="cv-entry-title">
                  {e.position}{e.company && <span className="cv-at"> · {e.company}</span>}
                </span>
                <span className="cv-date">
                  {[e.start, e.current ? "Present" : e.end].filter(Boolean).join(" – ")}
                </span>
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
                <span className="cv-entry-title">
                  {[e.degree, e.field].filter(Boolean).join(", ")}
                  <span className="cv-at"> · {e.institution}</span>
                </span>
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
                {c.url
                  ? <a href={prefixUrl(c.url)} target="_blank" rel="noreferrer">{c.name}</a>
                  : c.name}
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
            {cv.languages.map((l) => (
              <span key={l.id}><b>{l.name}</b>{l.level && ` — ${l.level}`}</span>
            ))}
          </div>
        </Section>
      )}

      {cv.awards.length > 0 && (
        <Section title="Awards">
          {cv.awards.map((a) => (
            <div className="cv-row" key={a.id}>
              <span className="cv-entry-title">
                {a.name}{a.issuer && <span className="cv-at"> · {a.issuer}</span>}
              </span>
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
                <span className="cv-entry-title">
                  {v.role}{v.org && <span className="cv-at"> · {v.org}</span>}
                </span>
                <span className="cv-date">{v.date}</span>
              </div>
              {v.description && <p className="cv-entry-desc">{v.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {cv.customSections.map((s) =>
        (s.title || s.content) && (
          <Section title={s.title || "Section"} key={s.id}>
            <ul className="cv-bullets">
              {lines(s.content).map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </Section>
        )
      )}
    </article>
  );
}
