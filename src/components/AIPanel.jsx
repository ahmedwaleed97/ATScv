import React, { useState } from "react";
import { Sparkles, X, ChevronRight } from "lucide-react";
import { GEMINI, KEY_FROM_ENV, geminiReview, analyzeLocally, cvToText, shortErr } from "../lib/ai";
import ReviewResult from "./ReviewResult";

function KeyField() {
  const [val, setVal] = useState(GEMINI.key);
  const [show, setShow] = useState(false);

  return (
    <div className="keyfield">
      <button className="keyfield-toggle" onClick={() => setShow((s) => !s)}>
        {GEMINI.key
          ? KEY_FROM_ENV
            ? "✓ Gemini key loaded from .env"
            : "✓ Gemini connected"
          : "Use Gemini (paste your key)"}
        <ChevronRight size={14} className={show ? "open" : ""} />
      </button>
      {show && (
        <div className="keyfield-body">
          {KEY_FROM_ENV ? (
            <p className="keyfield-note">
              API key is loaded from your <code>.env</code> file (VITE_GEMINI_API_KEY).
            </p>
          ) : (
            <>
              <input
                className="input"
                type="password"
                placeholder="Gemini API key (kept in memory only)"
                value={val}
                onChange={(e) => { setVal(e.target.value); GEMINI.key = e.target.value.trim(); }}
              />
              <p className="keyfield-note">
                For local testing. The key never leaves this tab or gets saved — refresh and it's gone.
                Leave blank to use the offline analyzer. To persist it, add it to your .env file.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function AIPanel({ cv }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const run = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await geminiReview(cvToText(cv));
      setResult(r);
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
          <button className="btn btn-accent btn-block" onClick={run}>
            <Sparkles size={16} /> Analyze CV
          </button>
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
