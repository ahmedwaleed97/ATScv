import React from "react";

export default function Field({ label, value, onChange, placeholder, disabled }) {
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
