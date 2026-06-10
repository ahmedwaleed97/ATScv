import React from "react";

export default function TextArea({ label, value, onChange, rows = 3, placeholder }) {
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
