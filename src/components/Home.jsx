import React from "react";
import {
  Sparkles, Eye, Download, Smartphone, Layers, ShieldCheck,
  ArrowLeft, Check, FileCheck2,
} from "lucide-react";
import Logo from "./Logo";
import ScoreRing from "./ui/ScoreRing";

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

export default function Home({ onStart, onCheck }) {
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
              <li><Check size={16} /> ATS-friendliness check</li>
              <li><Check size={16} /> Stronger achievement phrasing</li>
              <li><Check size={16} /> Missing-section + keyword flags</li>
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
