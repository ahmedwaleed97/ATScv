import React, { useState, useRef } from "react";
import { ArrowLeft, FileUp, Sparkles, Pencil } from "lucide-react";
import mammoth from "mammoth";
import Logo from "./Logo";
import ReviewResult from "./ReviewResult";
import { geminiReview, analyzeText, shortErr } from "../lib/ai";
import { extractPdfText } from "../lib/pdf";

export default function Checker({ onHome, onBuild }) {
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
    try { r = await geminiReview(text); }
    catch (e) { e2 = shortErr(e); r = analyzeText(text); }
    setApiErr(e2);
    setResult(r);
    setBusy(false);
  };

  return (
    <div className="checker">
      <header className="topbar no-print">
        <button className="icon-btn" onClick={onHome} aria-label="Back to home">
          <ArrowLeft size={20} />
        </button>
        <Logo size="sm" />
        <button className="btn btn-sm btn-ghost" onClick={onBuild}>Build new</button>
      </header>

      <div className="checker-body">
        <div className="checker-head">
          <span className="eyebrow">CV checker</span>
          <h1>Check your CV against the standards</h1>
          <p>
            Upload a PDF, Word file, or paste your CV text. You'll get a score, an ATS check,
            and a list of what to fix — nothing leaves your browser.
          </p>
        </div>

        <button className="dropzone" onClick={() => fileInput.current?.click()} disabled={reading}>
          <input ref={fileInput} type="file" accept=".pdf,.docx,.txt" hidden onChange={onFile} />
          {reading ? <div className="spinner sm" /> : <FileUp size={26} />}
          <span className="dz-main">
            {reading ? "Reading file…" : (fileName || "Upload a CV")}
          </span>
          <span className="dz-sub">
            {reading ? "Extracting text" : (fileName ? "Tap to choose another" : "PDF, Word (.docx), or text (.txt)")}
          </span>
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
