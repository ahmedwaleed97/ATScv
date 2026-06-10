import React from "react";

export default function Toggle({ label, checked, onChange }) {
  return (
    <button type="button" className="toggle" onClick={() => onChange(!checked)} aria-pressed={checked}>
      <span className={`toggle-track ${checked ? "on" : ""}`}>
        <span className="toggle-knob" />
      </span>
      <span className="toggle-label">{label}</span>
    </button>
  );
}
