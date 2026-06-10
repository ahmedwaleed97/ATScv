import React, { useState } from "react";
import { AlertTriangle, Star, TrendingUp, SpellCheck, CheckCircle, XCircle, Check, X, ChevronDown } from "lucide-react";
import ScoreRing from "./ui/ScoreRing";
import FeedbackBlock from "./ui/FeedbackBlock";

function ATSCard({ score, verdict, issues, passed }) {
  const isPass = verdict === "Pass";
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`ats-card ${isPass ? "ats-pass" : "ats-fail"}`}>
      <button className="ats-header" onClick={() => setExpanded((e) => !e)}>
        <div className="ats-verdict-badge">
          {isPass
            ? <CheckCircle size={18} />
            : <XCircle size={18} />}
          <span>ATS {verdict}</span>
        </div>
        <div className="ats-header-right">
          <span className="ats-score-label">{score}/100</span>
          <ChevronDown size={16} className={`ats-chev ${expanded ? "open" : ""}`} />
        </div>
      </button>

      <div className="ats-bar-wrap">
        <div className="ats-bar-track">
          <div className="ats-bar-fill" style={{ width: `${score}%`, background: isPass ? "var(--good)" : "var(--clay)" }} />
        </div>
      </div>

      {expanded && (
        <div className="ats-body">
          {issues && issues.length > 0 && (
            <div className="ats-group">
              <h5>Issues to fix</h5>
              {issues.map((issue, i) => (
                <div className="ats-item ats-item-fail" key={i}>
                  <X size={13} /> {issue}
                </div>
              ))}
            </div>
          )}
          {passed && passed.length > 0 && (
            <div className="ats-group">
              <h5>Checks passed</h5>
              {passed.map((check, i) => (
                <div className="ats-item ats-item-pass" key={i}>
                  <Check size={13} /> {check}
                </div>
              ))}
            </div>
          )}
          {(!issues || issues.length === 0) && (!passed || passed.length === 0) && (
            <p className="ats-empty">No detailed ATS data available.</p>
          )}
        </div>
      )}
    </div>
  );
}

function SpellingBlock({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="spelling-block">
      <h4><SpellCheck size={15} /> Spelling &amp; grammar ({items.length})</h4>
      <div className="spelling-list">
        {items.map((item, i) => (
          <div className="spelling-item" key={i}>
            <span className="spelling-wrong">{item.original}</span>
            <span className="spelling-arrow">→</span>
            <span className="spelling-fix">{item.fix}</span>
            {item.note && <span className="spelling-note">{item.note}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReviewResult({ result, onRerun, err }) {
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
          {onRerun && (
            <button className="btn btn-ghost btn-sm" onClick={onRerun}>Re-run</button>
          )}
        </div>
      </div>

      <ATSCard
        score={result.ats}
        verdict={result.ats_verdict || (result.ats >= 65 ? "Pass" : "Fail")}
        issues={result.ats_issues}
        passed={result.ats_passed}
      />

      {result.strengths.length > 0 && (
        <FeedbackBlock kind="good" icon={<Star size={15} />} title="Strengths" items={result.strengths} />
      )}
      {result.missing.length > 0 && (
        <FeedbackBlock kind="warn" icon={<AlertTriangle size={15} />} title="Missing / weak" items={result.missing} />
      )}
      {result.suggestions.length > 0 && (
        <FeedbackBlock kind="tip" icon={<TrendingUp size={15} />} title="Suggestions" items={result.suggestions} />
      )}

      <SpellingBlock items={result.spelling} />

      {result.keywords.length > 0 && (
        <div className="kw-block">
          <h4>Keywords to consider</h4>
          <div className="kw-list">{result.keywords.map((k) => <span key={k}>{k}</span>)}</div>
        </div>
      )}

      {fromGemini && !result.spelling?.length && (
        <p className="spelling-clean">No spelling or grammar issues found.</p>
      )}
    </div>
  );
}
